"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { STATUS_COLORS } from "@/lib/constants"

type RecentApplication = {
  id: string
  status: string
  createdAt: string
  creator: { name: string | null }
  campaign: { id: string; title: string }
}

interface Props {
  applications: RecentApplication[]
}

export function RecentApplicationsFeed({ applications }: Props) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Recent Applications</CardTitle>
      </CardHeader>
      <CardContent>
        {applications.length === 0 ? (
          <p className="text-sm text-muted-foreground">No applications yet.</p>
        ) : (
          <div>
            {applications.map((app) => (
              <div
                key={app.id}
                className="flex items-center justify-between py-2 border-b last:border-0 gap-2"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {app.creator.name ?? "Creator"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {app.campaign.title} · {new Date(app.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                      STATUS_COLORS[app.status as keyof typeof STATUS_COLORS] ?? ""
                    }`}
                  >
                    {app.status}
                  </span>
                  <Link
                    href={`/dashboard/brand/campaigns/${app.campaign.id}`}
                    className="text-xs text-primary hover:underline"
                  >
                    Review
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
