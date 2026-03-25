"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StatusBadge } from "@/components/shared/status-badge"
import { PlatformBadge } from "@/components/shared/platform-badge"
import { formatDate } from "@/lib/utils"
import type { ApplicationStatus } from "@prisma/client"

interface ApplicationRow {
  id: string
  createdAt: Date
  status: ApplicationStatus
  brandResponse?: string | null
  campaign: {
    title: string
    platforms: string[]
    brand: {
      name?: string | null
      image?: string | null
      brandProfile?: { companyName: string; logo?: string | null } | null
    }
  }
}

interface Props { applications: ApplicationRow[] }

export function ApplicationsTable({ applications }: Props) {
  if (applications.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground border rounded-lg">
        <p className="text-lg">No applications yet</p>
        <p className="text-sm mt-1">Discover campaigns and start applying!</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Campaign</TableHead>
          <TableHead>Brand</TableHead>
          <TableHead>Platforms</TableHead>
          <TableHead>Applied</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Brand Response</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {applications.map((app) => {
          const brandName = app.campaign.brand.brandProfile?.companyName ?? app.campaign.brand.name ?? "Brand"
          const initials = brandName.split(" ").map((s: string) => s[0]).join("").toUpperCase().slice(0, 2)
          return (
            <TableRow key={app.id}>
              <TableCell className="font-medium max-w-[180px] truncate">{app.campaign.title}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={app.campaign.brand.brandProfile?.logo ?? ""} />
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{brandName}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex gap-1 flex-wrap">
                  {app.campaign.platforms.slice(0, 2).map((p) => <PlatformBadge key={p} platform={p} />)}
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{formatDate(app.createdAt)}</TableCell>
              <TableCell><StatusBadge status={app.status} /></TableCell>
              <TableCell className="text-sm text-muted-foreground max-w-[200px]">
                {app.brandResponse ? (
                  <span className="line-clamp-2">{app.brandResponse}</span>
                ) : (
                  <span className="italic">No response yet</span>
                )}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
