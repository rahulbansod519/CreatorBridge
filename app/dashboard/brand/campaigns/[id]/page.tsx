import { notFound } from "next/navigation"
import { requireSession } from "@/features/auth/service"
import { getCampaignById } from "@/features/campaigns/service"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatusBadge } from "@/components/shared/status-badge"
import { PlatformBadge } from "@/components/shared/platform-badge"
import { Badge } from "@/components/ui/badge"
import { ApplicantTable } from "@/components/brand/applicant-table"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Calendar, DollarSign, Users } from "lucide-react"

export default async function CampaignDetailPage({ params }: { params: { id: string } }) {
  const user = await requireSession("BRAND")
  const campaign = await getCampaignById(params.id)

  if (!campaign || campaign.brandId !== user.id) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">{campaign.title}</h1>
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={campaign.status} />
            {campaign.niches.map((n) => <Badge key={n} variant="secondary" className="text-xs">{n}</Badge>)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <DollarSign className="h-4 w-4" />
          {formatCurrency(campaign.budgetMin, campaign.budgetMax)}
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          Deadline: {formatDate(campaign.deadline)}
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="h-4 w-4" />
          {campaign.applications.length} applicant{campaign.applications.length !== 1 ? "s" : ""}
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="applicants">Applicants ({campaign.applications.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <div>
            <h3 className="font-medium mb-2">Description</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{campaign.description}</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Required Platforms</h3>
            <div className="flex flex-wrap gap-2">
              {campaign.platforms.map((p) => <PlatformBadge key={p} platform={p} />)}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="applicants" className="mt-4">
          <ApplicantTable applications={campaign.applications as never} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
