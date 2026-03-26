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
