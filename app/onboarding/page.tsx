import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { RoleSelector } from "@/components/onboarding/role-selector"

export default async function OnboardingPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  if (session.user.onboarded) {
    redirect(session.user.role === "CREATOR" ? "/dashboard/creator" : "/dashboard/brand")
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <RoleSelector />
    </div>
  )
}
