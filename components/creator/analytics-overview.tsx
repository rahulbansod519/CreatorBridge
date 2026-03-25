"use client"

import { Users, TrendingUp, Briefcase, Award } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/shared/stat-card"
import { PlatformBadge } from "@/components/shared/platform-badge"
import { FollowerGrowthChart } from "@/components/creator/follower-growth-chart"
import { AudienceAgeChart } from "@/components/creator/audience-age-chart"
import { AudienceGenderChart } from "@/components/creator/audience-gender-chart"
import { getGrowthData, getAgeData, getGenderData } from "@/lib/mock-data"
import type { Platform } from "@prisma/client"

interface Props {
  userId: string
  platforms: Platform[]
  appStats: { total: number; hired: number; pending: number; shortlisted: number }
}

export function CreatorAnalyticsOverview({ userId, platforms, appStats }: Props) {
  const avgEngagement = platforms.length
    ? (platforms.reduce((s, p) => s + p.engagementRate, 0) / platforms.length).toFixed(1)
    : "0"

  const growthData = getGrowthData(userId, platforms.map((p) => ({ name: p.name, followersRange: p.followersRange })))
  const ageData = getAgeData(userId)
  const genderData = getGenderData(userId)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics Overview</h1>
        <p className="text-muted-foreground">Your combined performance across all platforms</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Platforms" value={platforms.length} icon={<Users className="h-4 w-4" />} />
        <StatCard label="Avg. Engagement" value={`${avgEngagement}%`} icon={<TrendingUp className="h-4 w-4" />} />
        <StatCard label="Applications" value={appStats.total} icon={<Briefcase className="h-4 w-4" />} />
        <StatCard label="Hired" value={appStats.hired} icon={<Award className="h-4 w-4" />} description={`${appStats.shortlisted} shortlisted`} />
      </div>

      {/* Platform stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Platform Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {platforms.map((p) => (
              <div key={p.id} className="rounded-lg border p-4 space-y-2">
                <PlatformBadge platform={p.name} />
                <p className="text-xs text-muted-foreground">{p.handle}</p>
                <p className="text-2xl font-bold">{p.followersRange}</p>
                <p className="text-xs text-muted-foreground">{p.engagementRate}% engagement</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Growth chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Follower Growth (6 months)</CardTitle>
        </CardHeader>
        <CardContent>
          <FollowerGrowthChart data={growthData} platforms={platforms.map((p) => p.name)} />
        </CardContent>
      </Card>

      {/* Demographics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Age Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <AudienceAgeChart data={ageData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Gender Split</CardTitle>
          </CardHeader>
          <CardContent>
            <AudienceGenderChart data={genderData} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
