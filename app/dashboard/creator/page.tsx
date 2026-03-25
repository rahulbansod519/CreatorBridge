import { requireSession } from "@/features/auth/service"
import { getCreatorByUserId } from "@/features/profiles/service"
import { getCreatorAppStats } from "@/features/applications/service"
import { CreatorAnalyticsOverview } from "@/components/creator/analytics-overview"

export default async function CreatorDashboardPage() {
  const user = await requireSession("CREATOR")
  const [creator, appStats] = await Promise.all([
    getCreatorByUserId(user.id),
    getCreatorAppStats(user.id),
  ])

  const platforms = creator?.creatorProfile?.platforms ?? []

  return <CreatorAnalyticsOverview userId={user.id} platforms={platforms} appStats={appStats} />
}
