import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCampaigns, createCampaign } from "@/features/campaigns/service";
import { campaignSchema } from "@/lib/validations";
import type { CampaignStatus } from "@prisma/client";

async function getBrandId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  if (session.user.role === "BRAND") return session.user.id;
  const user = await db.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  return user?.role === "BRAND" ? session.user.id : null;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const niche = searchParams.get("niche") ?? undefined;
  const platform = searchParams.get("platform") ?? undefined;
  const status = (searchParams.get("status") as CampaignStatus) ?? undefined;

  const campaigns = await getCampaigns({ niche, platform, status });
  return NextResponse.json(campaigns);
}

export async function POST(req: Request) {
  try {
    const brandId = await getBrandId();
    if (!brandId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const data = campaignSchema.parse(body);
    const campaign = await createCampaign(brandId, data);
    return NextResponse.json(campaign, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
