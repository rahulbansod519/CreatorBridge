import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { BrandOnboarding } from "@/components/onboarding/brand-onboarding"

export default async function BrandOnboardingPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  if (session.user.onboarded) redirect("/dashboard/brand")

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <BrandOnboarding />
    </div>
  )
}
