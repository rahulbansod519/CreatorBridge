import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { applyToCampaign, getApplicationsForCreator } from "@/features/applications/service";
import { applicationSchema } from "@/lib/validations";

async function getCreatorId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  if (session.user.role === "CREATOR") return session.user.id;
  // JWT may be stale — verify from DB
  const user = await db.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  return user?.role === "CREATOR" ? session.user.id : null;
}

export async function GET() {
  const creatorId = await getCreatorId();
  if (!creatorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const apps = await getApplicationsForCreator(creatorId);
  return NextResponse.json(apps);
}

export async function POST(req: Request) {
  try {
    const creatorId = await getCreatorId();
    if (!creatorId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const data = applicationSchema.parse(body);
    const app = await applyToCampaign(creatorId, data);
    return NextResponse.json(app, { status: 201 });
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes("Unique constraint")) {
      return NextResponse.json({ error: "Already applied" }, { status: 409 });
    }
    const msg = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
