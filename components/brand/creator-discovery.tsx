"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreatorCard } from "@/components/brand/creator-card"
import { NICHES, PLATFORMS, PLATFORM_LABELS, FOLLOWER_RANGES } from "@/lib/constants"
import type { CreatorSearchResult } from "@/types"

interface Props {
  creators: CreatorSearchResult[]
  brandCampaigns: { id: string; title: string }[]
}

export function CreatorDiscovery({ creators, brandCampaigns }: Props) {
  const [search, setSearch] = useState("")
  const [niche, setNiche] = useState("all")
  const [platform, setPlatform] = useState("all")
  const [followerRange, setFollowerRange] = useState("all")

  const filtered = creators.filter((c) => {
    const name = (c.name ?? c.email ?? "").toLowerCase()
    const matchSearch = !search || name.includes(search.toLowerCase()) ||
      c.creatorProfile?.niches.some((n) => n.toLowerCase().includes(search.toLowerCase()))
    const matchNiche = niche === "all" || c.creatorProfile?.niches.includes(niche)
    const matchPlatform = platform === "all" || c.creatorProfile?.platforms.some((p) => p.name === platform)
    const matchRange = followerRange === "all" || (() => {
      const idx = FOLLOWER_RANGES.indexOf(followerRange as never)
      return c.creatorProfile?.platforms.some((p) =>
        FOLLOWER_RANGES.indexOf(p.followersRange as never) >= idx
      )
    })()
    return matchSearch && matchNiche && matchPlatform && matchRange
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Find Creators</h1>
        <p className="text-muted-foreground">Discover and invite creators to your campaigns</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search by name or niche..." value={search} onChange={(e) => setSearch(e.target.value)} />
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
        <Select value={followerRange} onValueChange={setFollowerRange}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Any audience size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any audience size</SelectItem>
            {FOLLOWER_RANGES.map((r) => <SelectItem key={r} value={r}>{r}+</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border rounded-lg">
          <p className="text-lg">No creators found</p>
          <p className="text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <CreatorCard key={c.id} creator={c} brandCampaignIds={brandCampaigns} />
          ))}
        </div>
      )}
    </div>
  )
}
