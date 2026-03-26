import { requireSession } from "@/features/auth/service"
import { getBrandDashboardData } from "@/features/campaigns/service"
import { BrandAnalyticsOverview } from "@/components/brand/brand-analytics-overview"

export default async function BrandDashboardPage() {
  const user = await requireSession("BRAND")
  const data = await getBrandDashboardData(user.id)

  return (
    <BrandAnalyticsOverview
      stats={data.stats}
      funnel={data.funnel}
      niches={data.niches}
      campaignStats={data.campaignStats.map((c) => ({
        ...c,
        deadline: c.deadline.toISOString(),
      }))}
      recentApplications={data.recentApplications.map((a) => ({
        id: a.id,
        status: a.status,
        createdAt: a.createdAt.toISOString(),
        creator: { name: a.creator.name },
        campaign: { id: a.campaign.id, title: a.campaign.title },
      }))}
      inviteStats={data.inviteStats}
      creatorQuality={data.creatorQuality}
      budgetStats={data.budgetStats}
    />
  )
}
