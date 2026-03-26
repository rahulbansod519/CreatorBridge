import { NextResponse } from "next/server";
import { updateApplicationStatus } from "@/features/applications/service";
import { applicationStatusSchema } from "@/lib/validations";
import { withRole } from "@/lib/api-auth";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  return withRole("BRAND", async (req, { userId }) => {
    const body = await req.json();
    const data = applicationStatusSchema.parse(body);
    await updateApplicationStatus(params.id, userId, data);
    return NextResponse.json({ success: true });
  })(req);
}
