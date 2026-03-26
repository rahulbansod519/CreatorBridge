"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { STATUS_COLORS } from "@/lib/constants"

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
  applications: RecentApp[]
  invites: PendingInvite[]
}

export function RecentActivityFeed({ applications, invites: initial }: Props) {
  const [invites, setInvites] = useState(initial)

  async function respond(id: string, status: "ACCEPTED" | "DECLINED") {
    await fetch(`/api/invites/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    setInvites((prev) => prev.filter((i) => i.id !== id))
  }

  const empty = applications.length === 0 && invites.length === 0

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {empty ? (
          <p className="text-sm text-muted-foreground">No recent activity yet.</p>
        ) : (
          <div className="space-y-2">
            {invites.map((invite) => (
              <div
                key={invite.id}
                className="flex items-start justify-between gap-3 p-3 rounded-lg border border-yellow-500/30 bg-yellow-500/5"
              >
                <div className="space-y-0.5 min-w-0">
                  <p className="text-sm font-medium truncate">
                    Invite from {invite.brand.brandProfile?.companyName ?? "Brand"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {invite.campaign.title}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => respond(invite.id, "ACCEPTED")}
                  >
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => respond(invite.id, "DECLINED")}
                  >
                    Decline
                  </Button>
                </div>
              </div>
            ))}

            {applications.map((app) => (
              <div
                key={app.id}
                className="flex items-center justify-between gap-2 py-2 border-b last:border-0"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{app.campaign.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {app.campaign.brand?.brandProfile?.companyName ?? "Brand"} ·{" "}
                    {new Date(app.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-xs px-2 py-0.5 rounded-full border font-medium ${
                    STATUS_COLORS[app.status as keyof typeof STATUS_COLORS] ?? ""
                  }`}
                >
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
