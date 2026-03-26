import { requireSession } from "@/features/auth/service"
import { getCreatorDashboardData } from "@/features/profiles/service"
import { CreatorAnalyticsOverview } from "@/components/creator/analytics-overview"

export default async function CreatorDashboardPage() {
  const user = await requireSession("CREATOR")
  const { creator, appStats, pendingInvites, recentApplications } =
    await getCreatorDashboardData(user.id)

  const platforms = creator?.creatorProfile?.platforms ?? []
  const cp = creator?.creatorProfile
  const profile = cp
    ? { bio: cp.bio, location: cp.location, mediaKitUrl: cp.mediaKitUrl, niches: cp.niches }
    : null

  const serializedInvites = pendingInvites.map((i) => ({
    id: i.id,
    createdAt: i.createdAt.toISOString(),
    brand: { brandProfile: i.brand.brandProfile ? { companyName: i.brand.brandProfile.companyName } : null },
    campaign: { title: i.campaign.title },
  }))

  const serializedApps = recentApplications.map((a) => ({
    id: a.id,
    status: a.status,
    createdAt: a.createdAt.toISOString(),
    campaign: {
      title: a.campaign.title,
      brand: {
        brandProfile: a.campaign.brand?.brandProfile
          ? { companyName: a.campaign.brand.brandProfile.companyName }
          : null,
      },
    },
  }))

  return (
    <CreatorAnalyticsOverview
      userId={user.id}
      platforms={platforms}
      appStats={appStats}
      pendingInvitesCount={pendingInvites.length}
      pendingInvites={serializedInvites}
      recentApplications={serializedApps}
      profile={profile}
    />
  )
}
