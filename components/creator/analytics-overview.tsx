"use client"

import { Users, TrendingUp, Briefcase, Mail } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/shared/stat-card"
import { PlatformBadge } from "@/components/shared/platform-badge"
import { FollowerGrowthChart } from "@/components/creator/follower-growth-chart"
import { AudienceAgeChart } from "@/components/creator/audience-age-chart"
import { AudienceGenderChart } from "@/components/creator/audience-gender-chart"
import { ApplicationStatsChart } from "@/components/creator/application-stats-chart"
import { ProfileCompleteness } from "@/components/creator/profile-completeness"
import { RecentActivityFeed } from "@/components/creator/recent-activity-feed"
import { getGrowthData, getAgeData, getGenderData } from "@/lib/mock-data"
import { FOLLOWER_RANGE_MIDPOINT } from "@/lib/constants"
import type { Platform } from "@prisma/client"

const ENGAGEMENT_THRESHOLDS: Record<string, [number, number]> = {
  instagram: [3, 1],
  youtube: [2, 0.5],
  tiktok: [5, 2],
  twitter: [1, 0.3],
  linkedin: [2, 0.5],
}

function engagementColor(platform: string, rate: number) {
  const [good, avg] = ENGAGEMENT_THRESHOLDS[platform.toLowerCase()] ?? [3, 1]
  if (rate >= good) return "text-green-500"
  if (rate >= avg) return "text-yellow-500"
  return "text-red-500"
}

type ProfileData = {
  bio: string
  location: string | null
  mediaKitUrl: string | null
  niches: string[]
} | null

type RecentApp = {
  id: string
  status: string
  createdAt: string
  campaign: {
    title: string
    brand: { brandProfile: { companyName: string } | null } | null
  }
}

type PendingInvite = {
  id: string
  createdAt: string
  brand: { brandProfile: { companyName: string } | null }
  campaign: { title: string }
}

interface Props {
  userId: string
  platforms: Platform[]
  appStats: { total: number; hired: number; pending: number; shortlisted: number; rejected: number }
  pendingInvitesCount: number
  pendingInvites: PendingInvite[]
  recentApplications: RecentApp[]
  profile: ProfileData
}

export function CreatorAnalyticsOverview({
  userId,
  platforms,
  appStats,
  pendingInvitesCount,
  pendingInvites,
  recentApplications,
  profile,
}: Props) {
  const avgEngagement = platforms.length
    ? (platforms.reduce((s, p) => s + p.engagementRate, 0) / platforms.length).toFixed(1)
    : "0"

  const totalReach = platforms.reduce(
    (s, p) => s + (FOLLOWER_RANGE_MIDPOINT[p.followersRange] ?? 0),
    0
  )
  const formattedReach =
    totalReach >= 1_000_000
      ? `${(totalReach / 1_000_000).toFixed(1)}M`
      : totalReach >= 1_000
      ? `${Math.round(totalReach / 1_000)}K`
      : String(totalReach)

  const successRate =
    appStats.total > 0 ? Math.round((appStats.hired / appStats.total) * 100) : 0

  const growthData = getGrowthData(
    userId,
    platforms.map((p) => ({ name: p.name, followersRange: p.followersRange }))
  )
  const ageData = getAgeData(userId)
  const genderData = getGenderData(userId)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics Overview</h1>
        <p className="text-muted-foreground">Your combined performance across all platforms</p>
      </div>

      {/* Top stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Est. Total Reach"
          value={formattedReach}
          icon={<Users className="h-4 w-4" />}
          description="across all platforms"
        />
        <StatCard
          label="Avg. Engagement"
          value={`${avgEngagement}%`}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <StatCard
          label="Success Rate"
          value={`${successRate}%`}
          icon={<Briefcase className="h-4 w-4" />}
          description={`${appStats.hired} hired / ${appStats.total} applied`}
        />
        <StatCard
          label="Pending Invites"
          value={pendingInvitesCount}
          icon={<Mail className="h-4 w-4" />}
          description={pendingInvitesCount > 0 ? "Brands reaching out!" : "No invites yet"}
        />
      </div>

      {/* Platform breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Platform Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {platforms.map((p) => (
              <div key={p.id} className="rounded-lg border p-4 space-y-2">
                <PlatformBadge platform={p.name} />
                <p className="text-xs text-muted-foreground">{p.handle}</p>
                <p className="text-xl font-bold">{p.followersRange}</p>
                <p className={`text-sm font-medium ${engagementColor(p.name, p.engagementRate)}`}>
                  {p.engagementRate}% engagement
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Profile completeness */}
      <ProfileCompleteness profile={profile} platformCount={platforms.length} />

      {/* Growth chart + Application donut */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              Follower Growth
              <span className="text-xs font-normal text-muted-foreground">Estimated</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FollowerGrowthChart
              data={growthData}
              platforms={platforms.map((p) => p.name)}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Application Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ApplicationStatsChart appStats={appStats} />
          </CardContent>
        </Card>
      </div>

      {/* Demographics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              Age Distribution
              <span className="text-xs font-normal text-muted-foreground">Estimated</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AudienceAgeChart data={ageData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              Gender Split
              <span className="text-xs font-normal text-muted-foreground">Estimated</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AudienceGenderChart data={genderData} />
          </CardContent>
        </Card>
      </div>

      {/* Recent activity */}
      <RecentActivityFeed applications={recentApplications} invites={pendingInvites} />
    </div>
  )
}
