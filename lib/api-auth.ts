import { NextResponse } from "next/server";
import { ZodError, type ZodTypeAny, type infer as ZodInfer } from "zod";
import { Prisma } from "@prisma/client";
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
  if (
    e instanceof Prisma.PrismaClientKnownRequestError ||
    e instanceof Prisma.PrismaClientUnknownRequestError ||
    e instanceof Prisma.PrismaClientInitializationError
  ) {
    console.error("[api] Database error:", e.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
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
