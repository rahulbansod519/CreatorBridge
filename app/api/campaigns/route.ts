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
