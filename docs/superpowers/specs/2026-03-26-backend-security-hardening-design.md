# Backend Security Hardening — Design Spec

**Date:** 2026-03-26
**Status:** Approved
**Scope:** Full security hardening — authorization gaps, input validation, rate limiting

---

## 1. Goal

Harden the CreatorBridge API backend against the following classes of vulnerability:

- Missing authentication guards on public routes
- Missing authorization (ownership) checks in services
- Unvalidated query parameters passed directly to Prisma
- Missing role enforcement on mutation routes
- No rate limiting on any endpoint

The approach is **Approach B**: a centralized auth helper layer + targeted service/route patches + edge-level rate limiting. No structural changes to the feature service pattern.

---

## 2. Architecture Overview

Three layers of change, each with a single clear purpose:

```
┌─────────────────────────────────────────────────────┐
│  middleware.ts  (Next.js edge middleware)            │
│  → rate limiting on all /api/* routes               │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│  lib/api-auth.ts  (new shared helper)               │
│  → replaces duplicated getBrandId/getCreatorId      │
│  → withRole(role, handler) wrapper                  │
│  → withAnyAuth(handler) wrapper                     │
│  → parseQueryParams(schema, searchParams) helper    │
│  → handleApiError(e) serializer                     │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│  Route + Service patches  (targeted fixes)          │
│  → ownership checks, campaign status guard,         │
│    invite ownership, Zod query param parsing        │
└─────────────────────────────────────────────────────┘
```

---

## 3. `lib/api-auth.ts` — Centralized Auth Helper

### 3.1 `withRole(role, handler)`

Replaces the copy-pasted `getBrandId()` / `getCreatorId()` helpers present in four route files.

**Behaviour:**
1. Read session via `auth()` from `lib/auth.ts`
2. Return `401 Unauthorized` if no session
3. Check role from JWT — if mismatched, fall back to DB (handles stale JWT post-onboarding, same logic as current pattern)
4. Return `403 Forbidden` if wrong role
5. Call inner handler with `{ userId: string, role: UserRole }` injected

**Signature:**
```ts
type AuthedHandler = (
  req: Request,
  ctx: { userId: string; role: UserRole }
) => Promise<NextResponse>;

function withRole(role: UserRole, handler: AuthedHandler): (req: Request) => Promise<NextResponse>
```

**Dynamic route params:** Next.js App Router passes `params` as the second argument to route handlers (`GET(req, { params })`). `withRole` wraps only the `req` argument. In dynamic routes, the outer route handler still receives the standard `{ params }` second argument from Next.js — it is NOT passed through `withRole`. The developer accesses `params` in the outer function, then closes over the `userId` from the `withRole` context:

```ts
// Dynamic route: app/api/applications/[id]/route.ts
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  return withRole("BRAND", async (req, { userId }) => {
    await updateApplicationStatus(params.id, userId, data);
  })(req);
}
```

### 3.2 `withAnyAuth(handler)`

For routes that require login but no specific role (e.g. `GET /api/campaigns`). Same flow as `withRole` but skips role assertion.

### 3.3 `parseQueryParams(schema, searchParams)`

Parses and validates URL search params via a Zod schema. Returns parsed data or throws `ZodError`. Routes catch this via `handleApiError`.

### 3.4 `handleApiError(e)`

Unified error serializer for all API routes:
- `ZodError` → `400` with `{ error: "Validation error", fields: { ... } }`
- `ForbiddenError` (see 3.5) → `403` with `{ error: message }`
- `ConflictError` (see 3.5) → `409` with `{ error: message }`
- `Error` with known message → `400` with `{ error: message }`
- Unknown → `500` with `{ error: "Internal server error" }`

### 3.5 Typed Error Classes

Two typed error classes are added to `lib/api-auth.ts` so that services can signal HTTP semantics without importing Next.js:

```ts
export class ForbiddenError extends Error {
  constructor(msg = "Forbidden") { super(msg); this.name = "ForbiddenError"; }
}

export class ConflictError extends Error {
  constructor(msg = "Conflict") { super(msg); this.name = "ConflictError"; }
}
```

Services throw `ForbiddenError` for ownership violations and `ConflictError` for duplicate-record violations (e.g. "Already applied"). `handleApiError` maps these to `403` and `409` respectively, preserving the existing 409 behaviour in `POST /api/applications`.

---

## 4. Authorization Gap Fixes

### 4.1 `GET /api/campaigns` and `GET /api/campaigns/[id]` — require authentication

**Problem:** Both handlers return campaign data (including applications and creator profiles in the `[id]` case) to any unauthenticated caller.
**Fix:** Wrap both with `withAnyAuth`. Returns `401` if no session. Note: `GET /api/campaigns/[id]` must follow the dynamic-route param pattern described in Section 3.1 — `params.id` is accessed in the outer function, `withAnyAuth` provides `userId`.

### 4.2 `PATCH /api/applications/[id]` — consolidate inline role check

**Problem:** A role check via the inline `getBrandId()` helper already exists, but it is duplicated code. The substantive security gap is the missing *ownership* check, described in 4.3. Wrapping with `withRole("BRAND")` consolidates the role check; 4.3 is the critical fix.
**Fix:** Replace inline `getBrandId()` with `withRole("BRAND")` wrapper.

### 4.3 `updateApplicationStatus` — brand must own the campaign

**Problem:** `features/applications/service.ts` updates by `id` alone with no ownership check.
**Fix:** Before updating, fetch the application with its `campaign.brandId`. Assert `campaign.brandId === brandId`. Throw `new ForbiddenError("You do not own this campaign")` if not — `handleApiError` maps this to `403`.

**Updated signature:**
```ts
updateApplicationStatus(id: string, brandId: string, data: ApplicationStatusInput)
```

### 4.4 `sendInvite` — campaign must belong to the brand

**Problem:** A brand can send an invite referencing any campaign, including one they don't own.
**Fix:** `features/invites/service.ts` fetches the campaign before creating the invite and asserts `campaign.brandId === brandId`. Throws `new ForbiddenError("You do not own this campaign")` — mapped to `403` by `handleApiError`.

**Updated signature:**
```ts
sendInvite(brandId: string, data: InviteInput)  // unchanged externally
```

### 4.5 Creator applying to a non-ACTIVE campaign

**Problem:** `applyToCampaign` creates an application regardless of campaign status.

**Fix:** Add a `db.campaign.findUnique({ where: { id: data.campaignId } })` call at the top of `applyToCampaign` before the `db.application.create`. Throw `new Error("Campaign is not accepting applications")` if `campaign.status !== "ACTIVE"` or if the campaign doesn't exist.

Additionally, `applyToCampaign` must catch the Prisma unique-constraint error on `db.application.create` and re-throw `new ConflictError("Already applied")`. This replaces the current raw string-match in the route handler (`e.message.includes("Unique constraint")`). Without this change, `handleApiError` will never receive a `ConflictError` from this path — the Prisma error will fall through to the generic `500` branch, breaking the existing 409 behaviour.

**Implementation note:** The current `applyToCampaign` signature takes `(creatorId: string, data: ApplicationInput)` where `data.campaignId` is available — no signature change is needed. The new DB fetch adds one round-trip.

**Race condition acknowledgement:** The status check is best-effort, not transactional. A campaign could transition from ACTIVE to CLOSED between the check and the `create`. This is an acceptable trade-off — the unique constraint on `(campaignId, creatorId)` already guards against duplicate applications, and a closed-campaign application is low-risk and can be rejected by the brand. A database-level trigger or a serializable transaction would be needed for a hard guarantee, which is out of scope here.

---

## 5. Input Validation Improvements

### 5.1 Query param Zod parsing

`GET /api/campaigns` currently casts `status` directly:
```ts
const status = (searchParams.get("status") as CampaignStatus) ?? undefined;
```
Any arbitrary string passes through to Prisma. All GET routes with query params are updated to use `parseQueryParams(schema, searchParams)`.

**Routes affected:**
- `GET /api/campaigns` — validate `status`, `niche`, `platform` params

**Note:** Creator discovery (`features/discovery/service.ts`) is called directly from a Next.js server component (`app/dashboard/brand/creators/page.tsx`) via `requireSession`, not via an HTTP API route. No query-param parsing is needed there — the filters are passed as typed TypeScript arguments.

### 5.2 `inviteSchema` — add message max length

Current: `z.string().min(20)`
Updated: `z.string().min(20).max(1000)` — prevents oversized payloads.

### 5.3 Consistent error serialization

All route files currently use `e instanceof Error ? e.message : "Failed"`. This swallows Zod validation field errors. All routes switch to `handleApiError(e)` for consistent, structured error responses.

---

## 6. Rate Limiting

### 6.1 Implementation

Next.js `middleware.ts` with a sliding window in-memory limiter. No external dependencies. Keyed by client IP (`x-forwarded-for`, with fallback).

**Runtime:** The middleware must export `export const runtime = "nodejs"` as a top-level module export (not inside `config` — that field is reserved for the `matcher`). Next.js Edge Runtime uses isolated V8 contexts per invocation — module-level `Map` state does not persist between requests in that environment, making in-memory rate limiting non-functional. Node.js runtime middleware runs in a persistent process where module-level state is shared across requests on the same instance.

### 6.2 Limits

| Route pattern | Limit | Window |
|---------------|-------|--------|
| `POST /api/auth/register` | 5 requests | 15 minutes |
| `POST /api/applications` | 10 requests | 1 minute |
| `POST /api/invites` | 20 requests | 1 minute |
| All other `/api/*` | 60 requests | 1 minute |

### 6.3 Response

Exceeded limit returns `429 Too Many Requests` with a `Retry-After` header (seconds until window resets).

### 6.4 Trade-off

In-memory state is per-process — limits reset on server restart and do not share across multiple instances. This is appropriate for single-instance deployments (dev and small prod, running in Node.js runtime). **This will not work on Vercel's serverless/edge deployment** without an external store. A comment in `middleware.ts` documents the Upstash Redis upgrade path: swap the in-memory `Map` for `@upstash/ratelimit` with a one-line store change — the surrounding logic stays the same.

---

## 7. Files Changed

| File | Change type |
|------|-------------|
| `middleware.ts` | **New** — rate limiting |
| `lib/api-auth.ts` | **New** — `withRole`, `withAnyAuth`, `parseQueryParams`, `handleApiError`, `ForbiddenError`, `ConflictError` |
| `lib/validations.ts` | **Modified** — `inviteSchema` add `.max(1000)` |
| `app/api/campaigns/route.ts` | **Modified** — `withAnyAuth` on GET, Zod query params, `handleApiError` |
| `app/api/campaigns/[id]/route.ts` | **Modified** — `withAnyAuth` on GET, `withRole("BRAND")` on PATCH/DELETE, `handleApiError` |
| `app/api/applications/route.ts` | **Modified** — `withRole` replaces `getCreatorId()`, `handleApiError` |
| `app/api/applications/[id]/route.ts` | **Modified** — `withRole("BRAND")`, pass `brandId` to service |
| `app/api/invites/route.ts` | **Modified** — `withRole("BRAND")` replaces `getBrandId()`, `handleApiError` |
| `app/api/invites/[id]/route.ts` | **Modified** — `withRole("CREATOR")`, `handleApiError` |
| `features/applications/service.ts` | **Modified** — ownership check in `updateApplicationStatus`, campaign status guard in `applyToCampaign` |
| `features/invites/service.ts` | **Modified** — campaign ownership check in `sendInvite` |

---

## 8. Out of Scope

The following were considered and explicitly excluded:

- Messaging / real-time notifications — separate feature, separate spec
- Pagination for discovery — separate improvement, not a security concern
- Upstash Redis rate limiting — upgrade path documented but not implemented
- CSRF protection — NextAuth v5 handles this for session mutations; stateless JWT API routes are not vulnerable

---

## 9. Success Criteria

- [ ] No unauthenticated request can read campaigns
- [ ] A brand cannot update status on applications belonging to another brand's campaign
- [ ] A brand cannot send invites referencing campaigns they don't own
- [ ] A creator cannot apply to DRAFT or CLOSED campaigns
- [ ] All query params are validated with Zod before reaching services
- [ ] All API error responses use structured `{ error, fields? }` format
- [ ] Rate limiting returns `429` with `Retry-After` on excess requests
- [ ] Zero duplicated `getBrandId`/`getCreatorId` helpers across route files
