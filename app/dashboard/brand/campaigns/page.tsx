import { requireSession } from "@/features/auth/service"
import { getCampaignsForBrand } from "@/features/campaigns/service"
import { CampaignListTable } from "@/components/brand/campaign-list-table"

export default async function BrandCampaignsPage() {
  const user = await requireSession("BRAND")
  const campaigns = await getCampaignsForBrand(user.id)

  return <CampaignListTable campaigns={campaigns as never} />
}
