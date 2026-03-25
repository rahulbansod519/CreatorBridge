"use client"

import Link from "next/link"
import { Plus, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/shared/status-badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import type { CampaignStatus } from "@prisma/client"

interface CampaignRow {
  id: string
  title: string
  status: CampaignStatus
  budgetMin: number
  budgetMax: number
  deadline: Date
  _count?: { applications: number }
}

interface Props { campaigns: CampaignRow[] }

export function CampaignListTable({ campaigns }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Campaigns</h1>
          <p className="text-muted-foreground">Manage your brand campaigns</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/brand/campaigns/new">
            <Plus className="h-4 w-4 mr-2" /> New Campaign
          </Link>
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border rounded-lg">
          <p className="text-lg">No campaigns yet</p>
          <p className="text-sm mt-1">Create your first campaign to start finding creators</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead>Applicants</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.title}</TableCell>
                <TableCell><StatusBadge status={c.status} /></TableCell>
                <TableCell className="text-sm">{formatCurrency(c.budgetMin, c.budgetMax)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{formatDate(c.deadline)}</TableCell>
                <TableCell className="text-sm">{c._count?.applications ?? 0}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/dashboard/brand/campaigns/${c.id}`}>
                      <Eye className="h-4 w-4 mr-1" /> View
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
