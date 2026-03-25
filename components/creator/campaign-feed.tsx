"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CampaignCard } from "@/components/creator/campaign-card"
import { NICHES, PLATFORMS, PLATFORM_LABELS } from "@/lib/constants"
import type { CampaignWithBrand } from "@/types"

interface Props {
  campaigns: CampaignWithBrand[]
  appliedCampaignIds: string[]
}

export function CampaignFeed({ campaigns, appliedCampaignIds }: Props) {
  const [search, setSearch] = useState("")
  const [niche, setNiche] = useState("all")
  const [platform, setPlatform] = useState("all")

  const filtered = campaigns.filter((c) => {
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase())
    const matchNiche = niche === "all" || c.niches.includes(niche)
    const matchPlatform = platform === "all" || c.platforms.includes(platform)
    return matchSearch && matchNiche && matchPlatform
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Discover Campaigns</h1>
        <p className="text-muted-foreground">Find brand campaigns that match your niche</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search campaigns..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={niche} onValueChange={setNiche}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="All niches" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All niches</SelectItem>
            {NICHES.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={platform} onValueChange={setPlatform}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="All platforms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All platforms</SelectItem>
            {PLATFORMS.map((p) => <SelectItem key={p} value={p}>{PLATFORM_LABELS[p]}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">No campaigns found</p>
          <p className="text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <CampaignCard key={c.id} campaign={c} applied={appliedCampaignIds.includes(c.id)} />
          ))}
        </div>
      )}
    </div>
  )
}
