import { requireSession } from "@/features/auth/service"
import { getCampaignsForCreator } from "@/features/campaigns/service"
import { getApplicationsForCreator } from "@/features/applications/service"
import { CampaignFeed } from "@/components/creator/campaign-feed"

export default async function CreatorCampaignsPage() {
  const user = await requireSession("CREATOR")
  const [campaigns, applications] = await Promise.all([
    getCampaignsForCreator(user.id),
    getApplicationsForCreator(user.id),
  ])

  const appliedCampaignIds = applications.map((a) => a.campaignId)

  return <CampaignFeed campaigns={campaigns as never} appliedCampaignIds={appliedCampaignIds} />
}
