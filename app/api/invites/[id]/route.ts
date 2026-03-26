import { NextResponse } from "next/server";
import { updateInviteStatus } from "@/features/invites/service";
import { withRole } from "@/lib/api-auth";
import { inviteStatusSchema } from "@/lib/validations";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  return withRole("CREATOR", async (req, { userId }) => {
    const body = await req.json();
    const { status } = inviteStatusSchema.parse(body);
    await updateInviteStatus(params.id, userId, status);
    return NextResponse.json({ success: true });
  })(req);
}
