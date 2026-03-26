"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { STATUS_COLORS } from "@/lib/constants"

function DeadlineBadge({ deadline }: { deadline: string }) {
  const now = new Date()
  const due = new Date(deadline)
  const daysLeft = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (daysLeft < 0) {
    return (
      <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-medium">
        Overdue
      </span>
    )
  }
  if (daysLeft <= 3) {
    return (
      <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-medium">
        {daysLeft}d left
      </span>
    )
  }
  if (daysLeft <= 7) {
    return (
      <span className="text-xs px-1.5 py-0.5 rounded bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-medium">
        {daysLeft}d left
      </span>
    )
  }
  return (
    <span className="text-xs text-muted-foreground">
      {due.toLocaleDateString()}
    </span>
  )
}

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

interface Props {
  campaigns: CampaignStat[]
}

export function CampaignStatsTable({ campaigns }: Props) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Campaign Performance</CardTitle>
      </CardHeader>
      <CardContent>
        {campaigns.length === 0 ? (
          <p className="text-sm text-muted-foreground">No campaigns yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="text-left pb-2 pr-4 font-medium">Campaign</th>
                  <th className="text-center pb-2 px-2 font-medium">Status</th>
                  <th className="text-center pb-2 px-2 font-medium">Applied</th>
                  <th className="text-center pb-2 px-2 font-medium">Shortlisted</th>
                  <th className="text-center pb-2 px-2 font-medium">Hired</th>
                  <th className="text-right pb-2 pl-4 font-medium">Budget</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr key={c.id} className="border-b last:border-0">
                    <td className="py-2 pr-4">
                      <Link
                        href={`/dashboard/brand/campaigns/${c.id}`}
                        className="font-medium hover:underline"
                      >
                        {c.title}
                      </Link>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <DeadlineBadge deadline={c.deadline} />
                      </div>
                    </td>
                    <td className="py-2 px-2 text-center">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border ${
                          STATUS_COLORS[c.status as keyof typeof STATUS_COLORS] ?? ""
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-center font-semibold">{c.applied}</td>
                    <td className="py-2 px-2 text-center font-semibold">{c.shortlisted}</td>
                    <td className="py-2 px-2 text-center font-semibold">{c.hired}</td>
                    <td className="py-2 pl-4 text-right text-xs text-muted-foreground">
                      ${c.budgetMin.toLocaleString()}–${c.budgetMax.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
