"use client"

import { Megaphone, Users, Award, BarChart2, DollarSign, TrendingUp, Star } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/shared/stat-card"
import { ApplicationFunnelChart } from "@/components/brand/application-funnel-chart"
import { NichePerformanceChart } from "@/components/brand/niche-performance-chart"
import { CampaignStatsTable } from "@/components/brand/campaign-stats-table"
import { RecentApplicationsFeed } from "@/components/brand/recent-applications-feed"
import { InviteStats } from "@/components/brand/invite-stats"
import { PLATFORM_LABELS } from "@/lib/constants"

type CampaignStat = {
  id: string
  title: string
  status: string
  budgetMin: number
  budgetMax: number
  deadline: string
  applied: number
  shortlisted: number
  hired: number
}

type RecentApp = {
  id: string
  status: string
  createdAt: string
  creator: { name: string | null }
  campaign: { id: string; title: string }
}

interface Props {
  stats: {
    activeCampaigns: number
    totalApplications: number
    hired: number
    avgApplicationsPerCampaign: number
  }
  funnel: { stage: string; count: number }[]
  niches: { niche: string; count: number }[]
  campaignStats: CampaignStat[]
  recentApplications: RecentApp[]
  inviteStats: {
    sent: number
    accepted: number
    declined: number
    pending: number
    acceptanceRate: number
  }
  creatorQuality: {
    avgEngagementRate: number
    platformBreakdown: { name: string; count: number }[]
  }
  budgetStats: {
    totalCommitted: number
    estimatedCostPerHire: number
  }
}

export function BrandAnalyticsOverview({
  stats,
  funnel,
  niches,
  campaignStats,
  recentApplications,
  inviteStats,
  creatorQuality,
  budgetStats,
}: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Brand Overview</h1>
        <p className="text-muted-foreground">Your campaign performance at a glance</p>
      </div>

      {/* Row 1: Core stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          label="Active Campaigns"
          value={stats.activeCampaigns}
          icon={<Megaphone className="h-4 w-4" />}
        />
        <StatCard
          label="Total Applicants"
          value={stats.totalApplications}
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          label="Creators Hired"
          value={stats.hired}
          icon={<Award className="h-4 w-4" />}
        />
        <StatCard
          label="Avg / Campaign"
          value={stats.avgApplicationsPerCampaign}
          icon={<BarChart2 className="h-4 w-4" />}
          description="applications"
        />
        <StatCard
          label="Budget Committed"
          value={budgetStats.totalCommitted > 0 ? `$${budgetStats.totalCommitted.toLocaleString()}` : "—"}
          icon={<DollarSign className="h-4 w-4" />}
          description="active campaigns"
        />
        <StatCard
          label="Est. Cost / Hire"
          value={budgetStats.estimatedCostPerHire > 0 ? `$${budgetStats.estimatedCostPerHire.toLocaleString()}` : "—"}
          icon={<TrendingUp className="h-4 w-4" />}
          description="budget ÷ hired"
        />
      </div>

      {/* Row 2: Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Application Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <ApplicationFunnelChart funnel={funnel} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Niche Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <NichePerformanceChart data={niches} />
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Invite performance + Creator quality */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InviteStats stats={inviteStats} />

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Star className="h-4 w-4" />
              Hired Creator Quality
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.hired === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-2">
                No creators hired yet. Review applications to get started.
              </p>
            ) : (
              <>
                <div className="flex items-center gap-4">
                  <div className="text-center flex-1 p-3 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                      {creatorQuality.avgEngagementRate}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">Avg Engagement Rate</p>
                    <p className="text-xs text-muted-foreground">of hired creators</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-2">Platforms hired on</p>
                    <div className="space-y-1.5">
                      {creatorQuality.platformBreakdown.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No platform data</p>
                      ) : (
                        creatorQuality.platformBreakdown.map((p) => (
                          <div key={p.name} className="flex items-center justify-between text-sm">
                            <span className="text-xs capitalize">
                              {PLATFORM_LABELS[p.name as keyof typeof PLATFORM_LABELS] ?? p.name}
                            </span>
                            <span className="text-xs font-semibold">{p.count} creator{p.count !== 1 ? "s" : ""}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground border-t pt-2">
                  Industry avg: Instagram 3–6% · YouTube 2–4% · TikTok 5–9%
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 4: Campaign table + Recent applications */}
      <CampaignStatsTable campaigns={campaignStats} />
      <RecentApplicationsFeed applications={recentApplications} />
    </div>
  )
}
