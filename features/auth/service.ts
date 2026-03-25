import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { UserRole } from "@prisma/client";
import type { SessionUser } from "@/types";

export async function requireSession(role?: UserRole): Promise<SessionUser> {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = session.user as SessionUser;

  if (role && user.role !== role) {
    // JWT role may be stale right after onboarding — verify from DB
    const dbUser = await db.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });

    if (dbUser?.role !== role) {
      const dest = dbUser?.role === "CREATOR" ? "/dashboard/creator" : "/dashboard/brand";
      redirect(dest);
    }

    // DB confirms correct role — patch user object and allow through
    user.role = dbUser?.role ?? user.role;
  }

  return user;
}

export async function getOptionalSession() {
  const session = await auth();
  return session?.user as SessionUser | undefined;
}
