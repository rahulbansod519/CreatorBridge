"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { campaignSchema, type CampaignInput } from "@/lib/validations"
import { NICHES, PLATFORMS, PLATFORM_LABELS } from "@/lib/constants"
import { cn } from "@/lib/utils"

// Inline simple calendar component
function SimpleCalendar({ selected, onSelect }: { selected?: Date; onSelect: (d: Date) => void }) {
  const [month, setMonth] = useState(selected ?? new Date())
  const year = month.getFullYear()
  const mo = month.getMonth()
  const firstDay = new Date(year, mo, 1).getDay()
  const daysInMonth = new Date(year, mo + 1, 0).getDate()
  const today = new Date()

  return (
    <div className="p-3 w-64">
      <div className="flex items-center justify-between mb-2">
        <button onClick={() => setMonth(new Date(year, mo - 1))} className="p-1 hover:bg-accent rounded">‹</button>
        <span className="text-sm font-medium">{format(month, "MMMM yyyy")}</span>
        <button onClick={() => setMonth(new Date(year, mo + 1))} className="p-1 hover:bg-accent rounded">›</button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center text-xs text-muted-foreground mb-1">
        {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {Array.from({ length: firstDay }).map((_, i) => <div key={i} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const date = new Date(year, mo, day)
          const isPast = date < today
          const isSelected = selected && format(date, "yyyy-MM-dd") === format(selected, "yyyy-MM-dd")
          return (
            <button
              key={day}
              disabled={isPast}
              onClick={() => onSelect(date)}
              className={cn("rounded text-xs p-1 hover:bg-accent", isPast && "opacity-30 cursor-not-allowed", isSelected && "bg-primary text-primary-foreground hover:bg-primary")}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function CampaignForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [calOpen, setCalOpen] = useState(false)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CampaignInput>({
    resolver: zodResolver(campaignSchema),
    defaultValues: { title: "", description: "", niches: [], platforms: [], budgetMin: 500, budgetMax: 5000, status: "DRAFT" },
  })

  const selectedNiches = watch("niches")
  const selectedPlatforms = watch("platforms")
  const deadline = watch("deadline")

  const onSubmit = handleSubmit(async (data) => {
    setLoading(true)
    setError(null)
    const res = await fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      setError((await res.json()).error ?? "Failed")
      setLoading(false)
      return
    }
    router.push("/dashboard/brand/campaigns")
    router.refresh()
  })

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create Campaign</h1>
        <p className="text-muted-foreground">Set up your campaign to start finding creators</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Basic Info</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Campaign title</Label>
              <Input placeholder="e.g. Summer Product Launch" {...register("title")} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Describe the campaign, what you're looking for, deliverables..." rows={4} {...register("description")} />
              {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select defaultValue="DRAFT" onValueChange={(v) => setValue("status", v as "DRAFT" | "ACTIVE")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft (not visible to creators)</SelectItem>
                  <SelectItem value="ACTIVE">Active (visible & accepting applications)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Targeting</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Niche categories</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {NICHES.map((n) => (
                  <div key={n} className="flex items-center gap-2">
                    <Checkbox
                      id={`niche-${n}`}
                      checked={selectedNiches?.includes(n)}
                      onCheckedChange={(checked) => {
                        const cur = watch("niches") ?? []
                        setValue("niches", checked ? [...cur, n] : cur.filter((x) => x !== n))
                      }}
                    />
                    <label htmlFor={`niche-${n}`} className="text-sm cursor-pointer">{n}</label>
                  </div>
                ))}
              </div>
              {errors.niches && <p className="text-xs text-destructive">{errors.niches.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Required platforms</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PLATFORMS.map((p) => (
                  <div key={p} className="flex items-center gap-2">
                    <Checkbox
                      id={`plat-${p}`}
                      checked={selectedPlatforms?.includes(p)}
                      onCheckedChange={(checked) => {
                        const cur = watch("platforms") ?? []
                        setValue("platforms", checked ? [...cur, p] : cur.filter((x) => x !== p))
                      }}
                    />
                    <label htmlFor={`plat-${p}`} className="text-sm cursor-pointer">{PLATFORM_LABELS[p]}</label>
                  </div>
                ))}
              </div>
              {errors.platforms && <p className="text-xs text-destructive">{errors.platforms.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Budget & Timeline</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Min budget ($)</Label>
                <Input type="number" placeholder="500" {...register("budgetMin")} />
                {errors.budgetMin && <p className="text-xs text-destructive">{errors.budgetMin.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Max budget ($)</Label>
                <Input type="number" placeholder="5000" {...register("budgetMax")} />
                {errors.budgetMax && <p className="text-xs text-destructive">{errors.budgetMax.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Application deadline</Label>
              <Popover open={calOpen} onOpenChange={setCalOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left", !deadline && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {deadline ? format(deadline, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-auto" align="start">
                  <SimpleCalendar
                    selected={deadline}
                    onSelect={(d) => { setValue("deadline", d); setCalOpen(false) }}
                  />
                </PopoverContent>
              </Popover>
              {errors.deadline && <p className="text-xs text-destructive">{errors.deadline.message}</p>}
            </div>
          </CardContent>
        </Card>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Campaign"}</Button>
        </div>
      </form>
    </div>
  )
}
