import { requireSession } from "@/features/auth/service"
import { getBrandStats } from "@/features/campaigns/service"
import { StatCard } from "@/components/shared/stat-card"
import { Megaphone, Users, Award, Tag } from "lucide-react"

export default async function BrandDashboardPage() {
  const user = await requireSession("BRAND")
  const stats = await getBrandStats(user.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Brand Overview</h1>
        <p className="text-muted-foreground">Your campaign performance at a glance</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Campaigns" value={stats.totalCampaigns} icon={<Megaphone className="h-4 w-4" />} />
        <StatCard label="Total Applications" value={stats.totalApplications} icon={<Users className="h-4 w-4" />} />
        <StatCard label="Creators Hired" value={stats.hiredCount} icon={<Award className="h-4 w-4" />} />
        <StatCard label="Top Niche" value={stats.topNiche} icon={<Tag className="h-4 w-4" />} />
      </div>
    </div>
  )
}
