import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { creatorOnboardingSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const data = creatorOnboardingSchema.parse(body);

    const username = slugify(session.user.name ?? data.bio.slice(0, 20));
    const uniqueUsername = `${username}-${session.user.id.slice(-4)}`;

    await db.$transaction(async (tx) => {
      // Delete existing platforms if re-submitting
      await tx.platform.deleteMany({ where: { creatorId: session.user.id } });
      await tx.creatorProfile.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          bio: data.bio,
          niches: data.niches,
          location: data.location,
          mediaKitUrl: data.mediaKitUrl,
          platforms: { create: data.platforms },
        },
        update: {
          bio: data.bio,
          niches: data.niches,
          location: data.location,
          mediaKitUrl: data.mediaKitUrl,
          platforms: { create: data.platforms },
        },
      });
      await tx.user.update({
        where: { id: session.user.id },
        data: { role: "CREATOR", onboarded: true, username: uniqueUsername },
      });
    });

    return NextResponse.json({ success: true, username: uniqueUsername });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Onboarding failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
