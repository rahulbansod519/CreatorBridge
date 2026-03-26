import { NextResponse } from "next/server";
import { sendInvite } from "@/features/invites/service";
import { inviteSchema } from "@/lib/validations";
import { withRole } from "@/lib/api-auth";

export const POST = withRole("BRAND", async (req, { userId }) => {
  const body = await req.json();
  const data = inviteSchema.parse(body);
  const invite = await sendInvite(userId, data);
  return NextResponse.json(invite, { status: 201 });
});
