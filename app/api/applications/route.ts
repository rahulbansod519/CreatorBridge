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
