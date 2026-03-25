import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { updateInviteStatus } from "@/features/invites/service";
import { z } from "zod";

const schema = z.object({ status: z.enum(["ACCEPTED", "DECLINED"]) });

async function getCreatorId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  if (session.user.role === "CREATOR") return session.user.id;
  const user = await db.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  return user?.role === "CREATOR" ? session.user.id : null;
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const creatorId = await getCreatorId();
    if (!creatorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const { status } = schema.parse(body);
    await updateInviteStatus(params.id, creatorId, status);
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
