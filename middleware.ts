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
