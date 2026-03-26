import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { platformSchema } from "@/lib/validations";
import { addPlatform, updatePlatform, deletePlatform } from "@/features/profiles/service";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = platformSchema.parse(body);
    const platform = await addPlatform(session.user.id, data);
    return NextResponse.json(platform, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to add platform";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

const updateBody = platformSchema.extend({ id: z.string() });

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, ...data } = updateBody.parse(body);
    const platform = await updatePlatform(id, session.user.id, data);
    return NextResponse.json(platform);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to update platform";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Platform ID required" }, { status: 400 });
    }

    await deletePlatform(id, session.user.id);
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to delete platform";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
