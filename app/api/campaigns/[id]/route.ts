import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCampaignById, updateCampaign } from "@/features/campaigns/service";

async function getBrandId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  if (session.user.role === "BRAND") return session.user.id;
  const user = await db.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  return user?.role === "BRAND" ? session.user.id : null;
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const campaign = await getCampaignById(params.id);
  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(campaign);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const brandId = await getBrandId();
  if (!brandId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  await updateCampaign(params.id, brandId, body);
  return NextResponse.json({ success: true });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const brandId = await getBrandId();
  if (!brandId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await updateCampaign(params.id, brandId, { status: "CLOSED" });
  return NextResponse.json({ success: true });
}
