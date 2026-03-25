import { requireSession } from "@/features/auth/service"
import { searchCreators } from "@/features/discovery/service"
import { getCampaignsForBrand } from "@/features/campaigns/service"
import { CreatorDiscovery } from "@/components/brand/creator-discovery"

export default async function BrandCreatorsPage() {
  const user = await requireSession("BRAND")
  const [creators, campaigns] = await Promise.all([
    searchCreators({}),
    getCampaignsForBrand(user.id),
  ])

  const activeCampaigns = campaigns
    .filter((c) => c.status === "ACTIVE")
    .map((c) => ({ id: c.id, title: c.title }))

  return <CreatorDiscovery creators={creators as never} brandCampaigns={activeCampaigns} />
}
