"use client"

import { useState } from "react"
import Link from "next/link"
import { MapPin } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { PlatformBadge } from "@/components/shared/platform-badge"
import { InviteModal } from "@/components/brand/invite-modal"
import type { CreatorSearchResult } from "@/types"

interface Props {
  creator: CreatorSearchResult
  brandCampaignIds: { id: string; title: string }[]
}

export function CreatorCard({ creator, brandCampaignIds }: Props) {
  const [inviteOpen, setInviteOpen] = useState(false)
  const profile = creator.creatorProfile
  const platforms = profile?.platforms ?? []
  const initials = (creator.name ?? creator.email).split(" ").map((s: string) => s[0]).join("").toUpperCase().slice(0, 2)
  const bestPlatform = platforms[0]

  return (
    <>
      <Card className="hover:border-primary/50 transition-colors">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={creator.image ?? ""} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <Link href={`/creator/${creator.username}`} className="font-semibold hover:text-primary transition-colors">
                {creator.name ?? creator.email}
              </Link>
              {profile?.location && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3" /> {profile.location}
                </p>
              )}
            </div>
          </div>

          {profile?.niches && (
            <div className="flex flex-wrap gap-1.5">
              {profile.niches.slice(0, 3).map((n) => (
                <Badge key={n} variant="secondary" className="text-xs">{n}</Badge>
              ))}
            </div>
          )}

          {bestPlatform && (
            <div className="flex items-center justify-between">
              <PlatformBadge platform={bestPlatform.name} />
              <div className="text-right">
                <p className="text-sm font-bold">{bestPlatform.followersRange}</p>
                <p className="text-xs text-muted-foreground">{bestPlatform.engagementRate}% eng.</p>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <Link href={`/creator/${creator.username}`}>View Profile</Link>
            </Button>
            {brandCampaignIds.length > 0 && (
              <Button size="sm" className="flex-1" onClick={() => setInviteOpen(true)}>
                Invite
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <InviteModal
        creatorId={creator.id}
        creatorName={creator.name ?? creator.email}
        campaigns={brandCampaignIds}
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
      />
    </>
  )
}
