"use client"

import { useState } from "react"
import { Calendar, DollarSign } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PlatformBadge } from "@/components/shared/platform-badge"
import { Badge } from "@/components/ui/badge"
import { ApplyModal } from "@/components/creator/apply-modal"
import { formatCurrency, formatDate } from "@/lib/utils"
import type { CampaignWithBrand } from "@/types"

interface Props {
  campaign: CampaignWithBrand
  applied?: boolean
}

export function CampaignCard({ campaign, applied: initialApplied = false }: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const [applied, setApplied] = useState(initialApplied)
  const brandName = campaign.brand.brandProfile?.companyName ?? campaign.brand.name ?? "Brand"
  const initials = brandName.split(" ").map((s: string) => s[0]).join("").toUpperCase().slice(0, 2)

  return (
    <>
      <Card className="flex flex-col h-full hover:border-primary/50 transition-colors">
        <CardContent className="flex flex-col gap-4 p-5 flex-1">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10 rounded-lg">
              <AvatarImage src={campaign.brand.brandProfile?.logo ?? ""} />
              <AvatarFallback className="rounded-lg text-sm">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{brandName}</p>
              <p className="text-base font-bold leading-tight">{campaign.title}</p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">{campaign.description}</p>

          <div className="flex flex-wrap gap-1.5">
            {campaign.niches.map((n) => (
              <Badge key={n} variant="secondary" className="text-xs">{n}</Badge>
            ))}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {campaign.platforms.map((p) => <PlatformBadge key={p} platform={p} />)}
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground mt-auto pt-2 border-t">
            <div className="flex items-center gap-1">
              <DollarSign className="h-3.5 w-3.5" />
              {formatCurrency(campaign.budgetMin, campaign.budgetMax)}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(campaign.deadline)}
            </div>
          </div>

          <Button
            className="w-full"
            variant={applied ? "secondary" : "default"}
            disabled={applied}
            onClick={() => setModalOpen(true)}
          >
            {applied ? "Applied ✓" : "Apply Now"}
          </Button>
        </CardContent>
      </Card>

      <ApplyModal
        campaignId={campaign.id}
        campaignTitle={campaign.title}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => setApplied(true)}
      />
    </>
  )
}
