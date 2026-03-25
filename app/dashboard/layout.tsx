import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user?.id) redirect("/login")

  // Check DB directly — JWT can be stale immediately after onboarding
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { onboarded: true },
  })
  if (!user?.onboarded) redirect("/onboarding")

  return <>{children}</>
}
