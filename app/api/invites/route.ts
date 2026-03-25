import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendInvite } from "@/features/invites/service";
import { inviteSchema } from "@/lib/validations";

async function getBrandId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  if (session.user.role === "BRAND") return session.user.id;
  const user = await db.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  return user?.role === "BRAND" ? session.user.id : null;
}

export async function POST(req: Request) {
  try {
    const brandId = await getBrandId();
    if (!brandId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const data = inviteSchema.parse(body);
    const invite = await sendInvite(brandId, data);
    return NextResponse.json(invite, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
