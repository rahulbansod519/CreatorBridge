# Backend Security Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Harden the CreatorBridge API against missing auth guards, ownership-check gaps, unvalidated query params, and zero rate limiting.

**Architecture:** A new `lib/api-auth.ts` centralises auth wrappers (`withRole`, `withAnyAuth`), typed error classes (`ForbiddenError`, `ConflictError`), and error serialisation (`handleApiError`). Services get targeted ownership/status guards. `middleware.ts` adds in-memory rate limiting at the Node.js middleware layer.

**Tech Stack:** Next.js 14 App Router, NextAuth v5 (beta), Prisma 5, Zod 3, Vitest (new), TypeScript 5.

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `lib/api-auth.ts` | **Create** | Auth wrappers, error classes, error serialiser, query param parser |
| `middleware.ts` | **Create** | Rate limiting for all `/api/*` routes |
| `lib/validations.ts` | **Modify** | Add `campaignQuerySchema`; add `.max(1000)` to invite message |
| `features/applications/service.ts` | **Modify** | Ownership check in `updateApplicationStatus`; status guard + `ConflictError` in `applyToCampaign` |
| `features/invites/service.ts` | **Modify** | Campaign ownership check in `sendInvite` |
| `app/api/campaigns/route.ts` | **Modify** | `withAnyAuth` on GET + Zod query params; `withRole("BRAND")` on POST |
| `app/api/campaigns/[id]/route.ts` | **Modify** | `withAnyAuth` on GET; `withRole("BRAND")` on PATCH/DELETE |
| `app/api/applications/route.ts` | **Modify** | `withRole("CREATOR")` on GET + POST; remove inline `getCreatorId` |
| `app/api/applications/[id]/route.ts` | **Modify** | `withRole("BRAND")` on PATCH; pass `brandId` to service |
| `app/api/invites/route.ts` | **Modify** | `withRole("BRAND")` on POST; remove inline `getBrandId` |
| `app/api/invites/[id]/route.ts` | **Modify** | `withRole("CREATOR")` on PATCH; remove inline `getCreatorId` |
| `vitest.config.ts` | **Create** | Vitest configuration with path alias support |
| `tests/lib/api-auth.test.ts` | **Create** | Unit tests for pure helpers (handleApiError, parseQueryParams, error classes) |

---

## Task 1: Bootstrap Vitest

**Files:**
- Create: `vitest.config.ts`
- Create: `tests/lib/api-auth.test.ts` (scaffold only)
- Modify: `package.json`

- [ ] **Step 1: Install Vitest and path-alias plugin**

```bash
npm install -D vitest vite-tsconfig-paths
```

Expected: installs `vitest` and `vite-tsconfig-paths` into `devDependencies`.

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
  },
});
```

- [ ] **Step 3: Add test script to `package.json`**

In the `"scripts"` block, add:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Create scaffold test file to confirm setup**

Create `tests/lib/api-auth.test.ts`:
```ts
import { describe, it, expect } from "vitest";

describe("setup", () => {
  it("works", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5: Run the scaffold test**

```bash
npm test
```

Expected output: `✓ tests/lib/api-auth.test.ts > setup > works`

- [ ] **Step 6: Commit**

```bash
git add vitest.config.ts tests/lib/api-auth.test.ts package.json package-lock.json
git commit -m "chore: add vitest test runner"
```

---

## Task 2: Create `lib/api-auth.ts` — error classes, handleApiError, parseQueryParams (TDD)

**Files:**
- Create: `lib/api-auth.ts` (partial — pure helpers only, no withRole yet)
- Modify: `tests/lib/api-auth.test.ts`

- [ ] **Step 1: Write failing tests**

Replace `tests/lib/api-auth.test.ts` with:

```ts
import { describe, it, expect } from "vitest";
import { ZodError, z } from "zod";
import {
  ForbiddenError,
  ConflictError,
  handleApiError,
  parseQueryParams,
} from "@/lib/api-auth";

describe("ForbiddenError", () => {
  it("has name ForbiddenError", () => {
    const e = new ForbiddenError("No access");
    expect(e.name).toBe("ForbiddenError");
    expect(e.message).toBe("No access");
    expect(e instanceof Error).toBe(true);
  });

  it("uses default message", () => {
    expect(new ForbiddenError().message).toBe("Forbidden");
  });
});

describe("ConflictError", () => {
  it("has name ConflictError", () => {
    const e = new ConflictError("Already applied");
    expect(e.name).toBe("ConflictError");
    expect(e.message).toBe("Already applied");
    expect(e instanceof Error).toBe(true);
  });

  it("uses default message", () => {
    expect(new ConflictError().message).toBe("Conflict");
  });
});

describe("handleApiError", () => {
  it("maps ZodError to 400 with field errors", async () => {
    const schema = z.object({ name: z.string().min(3) });
    let zodError!: ZodError;
    try {
      schema.parse({ name: "x" });
    } catch (e) {
      zodError = e as ZodError;
    }
    const res = handleApiError(zodError);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Validation error");
    expect(body.fields).toBeDefined();
    expect(body.fields["name"]).toBe("String must contain at least 3 character(s)");
  });

  it("maps ForbiddenError to 403", async () => {
    const res = handleApiError(new ForbiddenError("No access"));
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toBe("No access");
  });

  it("maps ConflictError to 409", async () => {
    const res = handleApiError(new ConflictError("Already applied"));
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error).toBe("Already applied");
  });

  it("maps generic Error to 400", async () => {
    const res = handleApiError(new Error("Something failed"));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Something failed");
  });

  it("maps unknown to 500", async () => {
    const res = handleApiError("oops");
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Internal server error");
  });
});

describe("parseQueryParams", () => {
  it("parses valid params", () => {
    const schema = z.object({
      status: z.enum(["ACTIVE", "DRAFT"]).optional(),
    });
    const params = new URLSearchParams("status=ACTIVE");
    const result = parseQueryParams(schema, params);
    expect(result).toEqual({ status: "ACTIVE" });
  });

  it("returns undefined for missing optional param", () => {
    const schema = z.object({ status: z.string().optional() });
    const result = parseQueryParams(schema, new URLSearchParams());
    expect(result.status).toBeUndefined();
  });

  it("throws ZodError for invalid enum value", () => {
    const schema = z.object({ status: z.enum(["ACTIVE", "DRAFT"]) });
    const params = new URLSearchParams("status=INVALID");
    expect(() => parseQueryParams(schema, params)).toThrow(ZodError);
  });
});
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npm test
```

Expected: fails with `Cannot find module '@/lib/api-auth'`

- [ ] **Step 3: Create `lib/api-auth.ts` with pure helpers**

```ts
import { NextResponse } from "next/server";
import { ZodError, type ZodTypeAny, type infer as ZodInfer } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { UserRole } from "@prisma/client";

// ── Typed error classes ──────────────────────────────────────────────────────

export class ForbiddenError extends Error {
  constructor(msg = "Forbidden") {
    super(msg);
    this.name = "ForbiddenError";
  }
}

export class ConflictError extends Error {
  constructor(msg = "Conflict") {
    super(msg);
    this.name = "ConflictError";
  }
}

// ── Error serialiser ─────────────────────────────────────────────────────────

export function handleApiError(e: unknown): NextResponse {
  if (e instanceof ZodError) {
    const fields = Object.fromEntries(
      e.errors.map((err) => [err.path.join("."), err.message])
    );
    return NextResponse.json(
      { error: "Validation error", fields },
      { status: 400 }
    );
  }
  if (e instanceof ForbiddenError) {
    return NextResponse.json({ error: e.message }, { status: 403 });
  }
  if (e instanceof ConflictError) {
    return NextResponse.json({ error: e.message }, { status: 409 });
  }
  if (e instanceof Error) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

// ── Query param parser ───────────────────────────────────────────────────────

export function parseQueryParams<T extends ZodTypeAny>(
  schema: T,
  searchParams: URLSearchParams
): ZodInfer<T> {
  const obj: Record<string, string> = {};
  searchParams.forEach((v, k) => {
    obj[k] = v;
  });
  return schema.parse(obj);
}

// ── Auth wrappers ────────────────────────────────────────────────────────────

export type AuthedHandler = (
  req: Request,
  ctx: { userId: string; role: UserRole | null }
) => Promise<NextResponse>;

/**
 * Wraps a route handler, requiring any authenticated session.
 * Returns 401 if not logged in. Injects { userId, role } into the handler.
 */
export function withAnyAuth(handler: AuthedHandler) {
  return async (req: Request): Promise<NextResponse> => {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
      return await handler(req, {
        userId: session.user.id,
        role: session.user.role ?? null,
      });
    } catch (e) {
      return handleApiError(e);
    }
  };
}

/**
 * Wraps a route handler, requiring a specific role.
 * Returns 401 if not logged in, 403 if wrong role.
 * Falls back to DB if JWT role is stale (e.g. right after onboarding).
 */
export function withRole(role: UserRole, handler: AuthedHandler) {
  return async (req: Request): Promise<NextResponse> => {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    let userRole: UserRole | null = session.user.role ?? null;

    if (userRole !== role) {
      // JWT role can be stale right after onboarding — verify from DB
      const dbUser = await db.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });
      userRole = dbUser?.role ?? null;
    }

    if (userRole !== role) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // userRole equals `role` here — cast is safe; the null case is rejected above
    try {
      return await handler(req, { userId, role: userRole as UserRole });
    } catch (e) {
      return handleApiError(e);
    }
  };
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npm test
```

Expected: all tests pass. If `NextResponse.json` is not available in the test environment, you may see an error — in that case, add to `vitest.config.ts`:
```ts
// inside test: {}
globals: true,
```
and re-run.

- [ ] **Step 5: Commit**

```bash
git add lib/api-auth.ts tests/lib/api-auth.test.ts
git commit -m "feat: add api-auth helpers (withRole, handleApiError, parseQueryParams)"
```

---

## Task 3: Update `lib/validations.ts`

**Files:**
- Modify: `lib/validations.ts`

- [ ] **Step 1: Add `campaignQuerySchema` and fix `inviteSchema` message max**

In `lib/validations.ts`, make two changes:

**Change 1** — find the `inviteSchema` definition and add `.max(1000)`:
```ts
// Before:
  message: z.string().min(20, "Message too short"),
// After:
  message: z.string().min(20, "Message too short").max(1000, "Message too long"),
```

**Change 2** — add `campaignQuerySchema` after the existing `campaignSchema`. Use `z.nativeEnum` so the inferred `status` type is `CampaignStatus` (the Prisma enum), which matches the `getCampaigns` filter signature exactly:
```ts
import { CampaignStatus } from "@prisma/client";

export const campaignQuerySchema = z.object({
  niche: z.string().optional(),
  platform: z.string().optional(),
  status: z.nativeEnum(CampaignStatus).optional(),
});
export type CampaignQueryParams = z.infer<typeof campaignQuerySchema>;
```

Note: `CampaignStatus` is already imported in `validations.ts` indirectly via `campaignSchema` using `z.enum(["DRAFT", "ACTIVE"])`. You will need to add the explicit import at the top of the file: `import { CampaignStatus } from "@prisma/client";`

- [ ] **Step 2: TypeScript compile check**

```bash
npm run build 2>&1 | head -30
```

Expected: no new TypeScript errors related to validations.ts.

- [ ] **Step 3: Commit**

```bash
git add lib/validations.ts
git commit -m "feat: add campaignQuerySchema and cap invite message at 1000 chars"
```

---

## Task 4: Patch `features/applications/service.ts`

**Files:**
- Modify: `features/applications/service.ts`

Two changes: (a) `updateApplicationStatus` gets a `brandId` param and ownership check; (b) `applyToCampaign` gets a campaign-status guard and converts Prisma unique errors to `ConflictError`.

- [ ] **Step 1: Replace the full file content**

```ts
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { ForbiddenError, ConflictError } from "@/lib/api-auth";
import type { ApplicationInput, ApplicationStatusInput } from "@/lib/validations";

export async function applyToCampaign(creatorId: string, data: ApplicationInput) {
  // Guard: campaign must be ACTIVE
  const campaign = await db.campaign.findUnique({ where: { id: data.campaignId } });
  if (!campaign || campaign.status !== "ACTIVE") {
    throw new Error("Campaign is not accepting applications");
  }

  try {
    return await db.application.create({
      data: { ...data, creatorId },
    });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      throw new ConflictError("Already applied");
    }
    throw e;
  }
}

export async function getApplicationsForCreator(creatorId: string) {
  return db.application.findMany({
    where: { creatorId },
    include: {
      campaign: {
        include: { brand: { include: { brandProfile: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getApplicationsForCampaign(campaignId: string) {
  return db.application.findMany({
    where: { campaignId },
    include: {
      creator: { include: { creatorProfile: { include: { platforms: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateApplicationStatus(
  id: string,
  brandId: string,
  data: ApplicationStatusInput
) {
  // Ownership check: brand must own the campaign this application belongs to
  const application = await db.application.findUnique({
    where: { id },
    include: { campaign: { select: { brandId: true } } },
  });
  if (!application || application.campaign.brandId !== brandId) {
    throw new ForbiddenError("You do not own this campaign");
  }

  return db.application.update({ where: { id }, data });
}

export async function getCreatorAppStats(creatorId: string) {
  const apps = await db.application.findMany({
    where: { creatorId },
    select: { status: true },
  });
  return {
    total: apps.length,
    hired: apps.filter((a) => a.status === "HIRED").length,
    pending: apps.filter((a) => a.status === "PENDING").length,
    shortlisted: apps.filter((a) => a.status === "SHORTLISTED").length,
  };
}
```

- [ ] **Step 2: TypeScript compile check**

```bash
npm run build 2>&1 | grep -E "error|Error" | head -20
```

Expected: no TypeScript errors. If you see `updateApplicationStatus` call sites complaining about missing `brandId` argument, that means route files still use the old 2-arg signature — fix those in subsequent tasks.

- [ ] **Step 3: Commit**

```bash
git add features/applications/service.ts
git commit -m "feat: add campaign status guard and ownership check to applications service"
```

---

## Task 5: Patch `features/invites/service.ts`

**Files:**
- Modify: `features/invites/service.ts`

- [ ] **Step 1: Replace the full file content**

```ts
import { db } from "@/lib/db";
import { ForbiddenError } from "@/lib/api-auth";
import type { InviteInput } from "@/lib/validations";
import type { InviteStatus } from "@prisma/client";

export async function sendInvite(brandId: string, data: InviteInput) {
  // Ownership check: brand must own the campaign they're inviting for
  const campaign = await db.campaign.findUnique({ where: { id: data.campaignId } });
  if (!campaign || campaign.brandId !== brandId) {
    throw new ForbiddenError("You do not own this campaign");
  }

  return db.invite.create({ data: { ...data, brandId } });
}

export async function getInvitesForCreator(creatorId: string) {
  return db.invite.findMany({
    where: { creatorId },
    include: {
      brand: { include: { brandProfile: true } },
      campaign: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateInviteStatus(
  id: string,
  creatorId: string,
  status: InviteStatus
) {
  return db.invite.updateMany({ where: { id, creatorId }, data: { status } });
}
```

- [ ] **Step 2: TypeScript compile check**

```bash
npm run build 2>&1 | grep -E "error|Error" | head -20
```

Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add features/invites/service.ts
git commit -m "feat: add campaign ownership check to sendInvite"
```

---

## Task 6: Patch `app/api/campaigns/route.ts`

**Files:**
- Modify: `app/api/campaigns/route.ts`

- [ ] **Step 1: Replace the full file content**

```ts
import { NextResponse } from "next/server";
import { getCampaigns, createCampaign } from "@/features/campaigns/service";
import { campaignSchema, campaignQuerySchema } from "@/lib/validations";
import { withAnyAuth, withRole, parseQueryParams } from "@/lib/api-auth";

export const GET = withAnyAuth(async (req) => {
  const { searchParams } = new URL(req.url);
  const filters = parseQueryParams(campaignQuerySchema, searchParams);
  const campaigns = await getCampaigns(filters);
  return NextResponse.json(campaigns);
});

export const POST = withRole("BRAND", async (req, { userId }) => {
  const body = await req.json();
  const data = campaignSchema.parse(body);
  const campaign = await createCampaign(userId, data);
  return NextResponse.json(campaign, { status: 201 });
});
```

- [ ] **Step 2: TypeScript compile check**

```bash
npm run build 2>&1 | grep -E "error|Error" | head -20
```

Expected: no errors.

- [ ] **Step 3: Manual smoke test (requires running dev server)**

```bash
# Unauthenticated request should return 401
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/campaigns
# Expected: 401

# Invalid status param should return 400
curl -s -H "Cookie: <paste your session cookie here>" \
  "http://localhost:3000/api/campaigns?status=GARBAGE" | jq .
# Expected: { "error": "Validation error", "fields": { "status": "..." } }
```

- [ ] **Step 4: Commit**

```bash
git add app/api/campaigns/route.ts
git commit -m "feat: require auth on GET /api/campaigns, add Zod query param validation"
```

---

## Task 7: Patch `app/api/campaigns/[id]/route.ts`

**Files:**
- Modify: `app/api/campaigns/[id]/route.ts`

- [ ] **Step 1: Replace the full file content**

```ts
import { NextResponse } from "next/server";
import { getCampaignById, updateCampaign } from "@/features/campaigns/service";
import { withAnyAuth, withRole } from "@/lib/api-auth";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  return withAnyAuth(async () => {
    const campaign = await getCampaignById(params.id);
    if (!campaign) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(campaign);
  })(req);
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  return withRole("BRAND", async (req, { userId }) => {
    const body = await req.json();
    await updateCampaign(params.id, userId, body);
    return NextResponse.json({ success: true });
  })(req);
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  return withRole("BRAND", async (_req, { userId }) => {
    await updateCampaign(params.id, userId, { status: "CLOSED" });
    return NextResponse.json({ success: true });
  })(req);
}
```

- [ ] **Step 2: TypeScript compile check**

```bash
npm run build 2>&1 | grep -E "error|Error" | head -20
```

- [ ] **Step 3: Manual smoke test**

```bash
# Unauthenticated GET should return 401
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/campaigns/<any-id>
# Expected: 401
```

- [ ] **Step 4: Commit**

```bash
git add app/api/campaigns/[id]/route.ts
git commit -m "feat: require auth on GET /api/campaigns/[id], use withRole on PATCH/DELETE"
```

---

## Task 8: Patch `app/api/applications/route.ts`

**Files:**
- Modify: `app/api/applications/route.ts`

- [ ] **Step 1: Replace the full file content**

```ts
import { NextResponse } from "next/server";
import {
  applyToCampaign,
  getApplicationsForCreator,
} from "@/features/applications/service";
import { applicationSchema } from "@/lib/validations";
import { withRole } from "@/lib/api-auth";

export const GET = withRole("CREATOR", async (_req, { userId }) => {
  const apps = await getApplicationsForCreator(userId);
  return NextResponse.json(apps);
});

export const POST = withRole("CREATOR", async (req, { userId }) => {
  const body = await req.json();
  const data = applicationSchema.parse(body);
  const app = await applyToCampaign(userId, data);
  return NextResponse.json(app, { status: 201 });
});
```

- [ ] **Step 2: TypeScript compile check**

```bash
npm run build 2>&1 | grep -E "error|Error" | head -20
```

- [ ] **Step 3: Commit**

```bash
git add app/api/applications/route.ts
git commit -m "feat: use withRole on applications route, remove duplicated getCreatorId"
```

---

## Task 9: Patch `app/api/applications/[id]/route.ts`

**Files:**
- Modify: `app/api/applications/[id]/route.ts`

This is the critical ownership fix — `brandId` is now passed to `updateApplicationStatus`.

- [ ] **Step 1: Replace the full file content**

```ts
import { NextResponse } from "next/server";
import { updateApplicationStatus } from "@/features/applications/service";
import { applicationStatusSchema } from "@/lib/validations";
import { withRole } from "@/lib/api-auth";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  return withRole("BRAND", async (req, { userId }) => {
    const body = await req.json();
    const data = applicationStatusSchema.parse(body);
    await updateApplicationStatus(params.id, userId, data);
    return NextResponse.json({ success: true });
  })(req);
}
```

- [ ] **Step 2: TypeScript compile check**

```bash
npm run build 2>&1 | grep -E "error|Error" | head -20
```

- [ ] **Step 3: Manual smoke test (security check)**

Start the dev server, sign in as `brand@glowup.com` (not the owner of TechGear campaigns), get the application ID of a TechGear campaign application, then:

```bash
curl -s -X PATCH http://localhost:3000/api/applications/<techgear-app-id> \
  -H "Content-Type: application/json" \
  -H "Cookie: <glowup-session-cookie>" \
  -d '{"status": "HIRED"}' | jq .
# Expected: { "error": "You do not own this campaign" }  →  HTTP 403
```

- [ ] **Step 4: Commit**

```bash
git add app/api/applications/[id]/route.ts
git commit -m "fix: enforce brand ownership check when updating application status"
```

---

## Task 10: Patch `app/api/invites/route.ts`

**Files:**
- Modify: `app/api/invites/route.ts`

- [ ] **Step 1: Replace the full file content**

```ts
import { NextResponse } from "next/server";
import { sendInvite } from "@/features/invites/service";
import { inviteSchema } from "@/lib/validations";
import { withRole } from "@/lib/api-auth";

export const POST = withRole("BRAND", async (req, { userId }) => {
  const body = await req.json();
  const data = inviteSchema.parse(body);
  const invite = await sendInvite(userId, data);
  return NextResponse.json(invite, { status: 201 });
});
```

- [ ] **Step 2: TypeScript compile check**

```bash
npm run build 2>&1 | grep -E "error|Error" | head -20
```

- [ ] **Step 3: Commit**

```bash
git add app/api/invites/route.ts
git commit -m "feat: use withRole on invites route, remove duplicated getBrandId"
```

---

## Task 11: Patch `app/api/invites/[id]/route.ts`

**Files:**
- Modify: `app/api/invites/[id]/route.ts`

- [ ] **Step 1: Replace the full file content**

```ts
import { NextResponse } from "next/server";
import { updateInviteStatus } from "@/features/invites/service";
import { withRole } from "@/lib/api-auth";
import { z } from "zod";

const inviteStatusSchema = z.object({
  status: z.enum(["ACCEPTED", "DECLINED"]),
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  return withRole("CREATOR", async (req, { userId }) => {
    const body = await req.json();
    const { status } = inviteStatusSchema.parse(body);
    await updateInviteStatus(params.id, userId, status);
    return NextResponse.json({ success: true });
  })(req);
}
```

- [ ] **Step 2: TypeScript compile check**

```bash
npm run build 2>&1 | grep -E "error|Error" | head -20
```

Expected: no errors. At this point, all inline `getBrandId`/`getCreatorId` helpers should be gone from route files.

- [ ] **Step 3: Verify no duplicate helpers remain**

```bash
grep -r "async function getBrandId\|async function getCreatorId" app/api/
```

Expected: no output (zero matches).

- [ ] **Step 4: Commit**

```bash
git add app/api/invites/[id]/route.ts
git commit -m "feat: use withRole on invites/[id] route, remove duplicated getCreatorId"
```

---

## Task 12: Add `middleware.ts` — rate limiting

**Files:**
- Create: `middleware.ts` (at project root, next to `package.json`)

- [ ] **Step 1: Create `middleware.ts`**

```ts
import { NextRequest, NextResponse } from "next/server";

// NOTE: In-memory rate limiter — works for single-process Node.js deployments.
// Limits reset on server restart and are NOT shared across multiple instances.
// For Vercel or other serverless/multi-instance deployments, replace `store`
// with @upstash/ratelimit:
//   import { Ratelimit } from "@upstash/ratelimit";
//   import { Redis } from "@upstash/redis";
//   const ratelimit = new Ratelimit({ redis: Redis.fromEnv(), limiter: Ratelimit.slidingWindow(60, "1 m") });
export const runtime = "nodejs";

// [routePattern, maxRequests, windowMs]
const ROUTE_LIMITS: [string, number, number][] = [
  ["POST /api/auth/register", 5, 15 * 60 * 1000],
  ["POST /api/applications", 10, 60 * 1000],
  ["POST /api/invites", 20, 60 * 1000],
];
const DEFAULT_MAX = 60;
const DEFAULT_WINDOW_MS = 60 * 1000;

const store = new Map<string, { count: number; resetAt: number }>();

function getLimits(method: string, pathname: string): [number, number] {
  const key = `${method} ${pathname}`;
  for (const [pattern, max, windowMs] of ROUTE_LIMITS) {
    if (key === pattern) return [max, windowMs];
  }
  return [DEFAULT_MAX, DEFAULT_WINDOW_MS];
}

function getIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "127.0.0.1"
  );
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith("/api/")) return NextResponse.next();

  const ip = getIp(req);
  const storeKey = `${ip}:${req.method}:${pathname}`;
  const [max, windowMs] = getLimits(req.method, pathname);
  const now = Date.now();

  const entry = store.get(storeKey);

  if (!entry || entry.resetAt <= now) {
    store.set(storeKey, { count: 1, resetAt: now + windowMs });
    return NextResponse.next();
  }

  if (entry.count >= max) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfter) },
      }
    );
  }

  entry.count++;
  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
```

- [ ] **Step 2: TypeScript compile check**

```bash
npm run build 2>&1 | grep -E "error|Error" | head -20
```

Expected: no errors.

- [ ] **Step 3: Manual smoke test — rate limiting**

Start dev server. Run this in a terminal (requires `bash`):

```bash
# Hit the register endpoint 6 times rapidly — 6th should be 429
for i in {1..6}; do
  status=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST http://localhost:3000/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"name":"test","email":"x@x.com","password":"password123"}')
  echo "Request $i: $status"
done
# Expected: requests 1-5 return 400 (validation/conflict), request 6 returns 429
```

- [ ] **Step 4: Commit**

```bash
git add middleware.ts
git commit -m "feat: add in-memory rate limiting to all /api/* routes"
```

---

## Task 13: Final build and full verification

**Files:** None (verification only)

- [ ] **Step 1: Run full test suite**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 2: Run production build**

```bash
npm run build
```

Expected: clean build with no TypeScript errors.

- [ ] **Step 3: Verify success criteria from spec**

Check each criterion manually:

```bash
# 1. No duplicate auth helpers
grep -r "async function getBrandId\|async function getCreatorId" app/api/
# Expected: no output

# 2. All route files import from @/lib/api-auth (not duplicating logic)
grep -r "withRole\|withAnyAuth" app/api/ --include="*.ts" -l
# Expected: all 7 route files listed

# 3. No route file imports { auth } or { db } directly (those moved to api-auth.ts)
grep -r "from \"@/lib/auth\"\|from \"@/lib/db\"" app/api/ --include="*.ts"
# Expected: no output
```

- [ ] **Step 4: Lint check**

```bash
npm run lint
```

Expected: no lint errors.

- [ ] **Step 5: Final commit if any cleanup needed**

```bash
git add -p  # review any stray changes
git commit -m "chore: final cleanup after backend security hardening"
```

---

## Success Criteria (from spec)

- [ ] No unauthenticated request can read campaigns
- [ ] A brand cannot update status on applications belonging to another brand's campaign
- [ ] A brand cannot send invites referencing campaigns they don't own
- [ ] A creator cannot apply to DRAFT or CLOSED campaigns
- [ ] All query params on `GET /api/campaigns` are validated with Zod before reaching services
- [ ] All API error responses use structured `{ error, fields? }` format
- [ ] Rate limiting returns `429` with `Retry-After` on excess requests
- [ ] Zero duplicated `getBrandId`/`getCreatorId` helpers across route files
