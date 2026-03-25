import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { CreatorOnboarding } from "@/components/onboarding/creator-onboarding"

export default async function CreatorOnboardingPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  if (session.user.onboarded) redirect("/dashboard/creator")

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <CreatorOnboarding />
    </div>
  )
}
