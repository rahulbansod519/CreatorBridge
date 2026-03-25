import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { brandOnboardingSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const data = brandOnboardingSchema.parse(body);

    await db.$transaction([
      db.brandProfile.create({
        data: { userId: session.user.id, ...data },
      }),
      db.user.update({
        where: { id: session.user.id },
        data: { role: "BRAND", onboarded: true, name: data.companyName },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Onboarding failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
