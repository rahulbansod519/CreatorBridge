"use client"

import { Mail, CheckCircle, XCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Props {
  stats: {
    sent: number
    accepted: number
    declined: number
    pending: number
    acceptanceRate: number
  }
}

export function InviteStats({ stats }: Props) {
  const { sent, accepted, declined, pending, acceptanceRate } = stats

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Direct Invite Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold">{sent}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Invites Sent</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400 flex items-center justify-center gap-1">
              <CheckCircle className="h-4 w-4" />
              {accepted}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Accepted</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-950/20">
            <p className="text-2xl font-bold text-red-500 dark:text-red-400 flex items-center justify-center gap-1">
              <XCircle className="h-4 w-4" />
              {declined}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Declined</p>
          </div>
        </div>

        {sent > 0 && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Acceptance rate</span>
              <span className="font-semibold text-foreground">{acceptanceRate}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden flex">
              <div
                className="bg-green-500 h-full transition-all"
                style={{ width: `${sent > 0 ? (accepted / sent) * 100 : 0}%` }}
              />
              <div
                className="bg-yellow-400 h-full transition-all"
                style={{ width: `${sent > 0 ? (pending / sent) * 100 : 0}%` }}
              />
              <div
                className="bg-red-400 h-full transition-all"
                style={{ width: `${sent > 0 ? (declined / sent) * 100 : 0}%` }}
              />
            </div>
            <div className="flex gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />Accepted</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />Pending</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />Declined</span>
            </div>
          </div>
        )}

        {sent === 0 && (
          <p className="text-sm text-muted-foreground text-center py-2">
            No invites sent yet. Discover creators and send direct invites.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
