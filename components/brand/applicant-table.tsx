"use client"

import { useState } from "react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { StatusBadge } from "@/components/shared/status-badge"
import { PlatformBadge } from "@/components/shared/platform-badge"
import type { ApplicationStatus } from "@prisma/client"

interface Applicant {
  id: string
  pitchMessage: string
  status: ApplicationStatus
  brandResponse?: string | null
  creator: {
    id: string
    name?: string | null
    image?: string | null
    username?: string | null
    creatorProfile?: {
      platforms: { name: string; followersRange: string }[]
    } | null
  }
}

interface Props { applications: Applicant[] }

export function ApplicantTable({ applications }: Props) {
  const [statuses, setStatuses] = useState<Record<string, ApplicationStatus>>({})
  const [responses, setResponses] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<Record<string, boolean>>({})

  const handleUpdate = async (id: string) => {
    const status = statuses[id]
    if (!status) return
    setSaving((s) => ({ ...s, [id]: true }))
    await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, brandResponse: responses[id] }),
    })
    setSaving((s) => ({ ...s, [id]: false }))
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground border rounded-lg">
        <p className="text-lg">No applications yet</p>
        <p className="text-sm mt-1">Applications will appear here once creators apply</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Creator</TableHead>
          <TableHead>Platforms</TableHead>
          <TableHead>Pitch</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {applications.map((app) => {
          const name = app.creator.name ?? app.creator.username ?? "Creator"
          const initials = name.split(" ").map((s: string) => s[0]).join("").toUpperCase().slice(0, 2)
          const platforms = app.creator.creatorProfile?.platforms ?? []
          const currentStatus = statuses[app.id] ?? app.status

          return (
            <TableRow key={app.id}>
              <TableCell>
                <div className="flex items-center gap-2 min-w-[140px]">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={app.creator.image ?? ""} />
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    {app.creator.username ? (
                      <Link href={`/creator/${app.creator.username}`} className="text-sm font-medium hover:text-primary">{name}</Link>
                    ) : (
                      <p className="text-sm font-medium">{name}</p>
                    )}
                    {platforms[0] && (
                      <p className="text-xs text-muted-foreground">{platforms[0].followersRange}</p>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex gap-1 flex-wrap max-w-[120px]">
                  {platforms.slice(0, 2).map((p) => <PlatformBadge key={p.name} platform={p.name} />)}
                </div>
              </TableCell>
              <TableCell className="max-w-[200px]">
                <p className="text-sm text-muted-foreground line-clamp-3">{app.pitchMessage}</p>
              </TableCell>
              <TableCell>
                <StatusBadge status={app.status} />
              </TableCell>
              <TableCell>
                <div className="space-y-2 min-w-[180px]">
                  <Select
                    defaultValue={app.status}
                    onValueChange={(v) => setStatuses((s) => ({ ...s, [app.id]: v as ApplicationStatus }))}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="SHORTLISTED">Shortlisted</SelectItem>
                      <SelectItem value="HIRED">Hired</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Textarea
                    placeholder="Send a message..."
                    rows={2}
                    className="text-xs"
                    defaultValue={app.brandResponse ?? ""}
                    onChange={(e) => setResponses((r) => ({ ...r, [app.id]: e.target.value }))}
                  />
                  <Button
                    size="sm"
                    className="w-full h-7 text-xs"
                    disabled={saving[app.id] || (!statuses[app.id] && !responses[app.id])}
                    onClick={() => handleUpdate(app.id)}
                  >
                    {saving[app.id] ? "Saving..." : "Update"}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
