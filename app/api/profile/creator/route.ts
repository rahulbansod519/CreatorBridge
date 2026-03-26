import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { creatorProfileUpdateSchema } from "@/lib/validations";
import { updateCreatorProfile, getCreatorByUserId } from "@/features/profiles/service";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const creator = await getCreatorByUserId(session.user.id);
    if (!creator?.creatorProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json(creator);
  } catch {
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = creatorProfileUpdateSchema.parse(body);

    const updated = await updateCreatorProfile(session.user.id, data);
    return NextResponse.json(updated);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Update failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
