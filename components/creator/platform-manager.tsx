"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Pencil, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlatformBadge } from "@/components/shared/platform-badge"
import { platformSchema, type PlatformInput } from "@/lib/validations"
import { PLATFORMS, PLATFORM_LABELS, FOLLOWER_RANGES } from "@/lib/constants"
import type { Platform } from "@prisma/client"

const FOLLOWER_LABEL: Record<string, string> = {
  youtube: "Subscribers",
  instagram: "Followers",
  tiktok: "Followers",
  twitter: "Followers",
  linkedin: "Connections",
}

interface Props {
  platforms: Platform[]
}

function PlatformForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel,
  loading,
}: {
  defaultValues: PlatformInput
  onSubmit: (data: PlatformInput) => Promise<void>
  onCancel: () => void
  submitLabel: string
  loading: boolean
}) {
  const form = useForm<PlatformInput>({
    resolver: zodResolver(platformSchema),
    defaultValues,
  })

  const selectedName = form.watch("name")

  return (
    <div className="rounded-lg border p-4 space-y-3 bg-muted/30">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Platform</Label>
          <Select
            onValueChange={(v) => form.setValue("name", v, { shouldValidate: true })}
            defaultValue={defaultValues.name}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {PLATFORMS.map((p) => (
                <SelectItem key={p} value={p}>{PLATFORM_LABELS[p]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.name && (
            <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Handle</Label>
          <Input placeholder="@yourhandle" {...form.register("handle")} />
          {form.formState.errors.handle && (
            <p className="text-xs text-destructive">{form.formState.errors.handle.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label className="text-xs">{FOLLOWER_LABEL[selectedName] ?? "Followers"}</Label>
          <Select
            onValueChange={(v) => form.setValue("followersRange", v, { shouldValidate: true })}
            defaultValue={defaultValues.followersRange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select range..." />
            </SelectTrigger>
            <SelectContent>
              {FOLLOWER_RANGES.map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.followersRange && (
            <p className="text-xs text-destructive">{form.formState.errors.followersRange.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Engagement %</Label>
          <Input type="number" step="0.1" placeholder="4.5" {...form.register("engagementRate")} />
          {form.formState.errors.engagementRate && (
            <p className="text-xs text-destructive">{form.formState.errors.engagementRate.message}</p>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          disabled={loading}
          onClick={form.handleSubmit(onSubmit)}
        >
          <Save className="h-3.5 w-3.5 mr-1.5" />
          {loading ? "Saving..." : submitLabel}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={loading}>
          <X className="h-3.5 w-3.5 mr-1.5" /> Cancel
        </Button>
      </div>
    </div>
  )
}

export function PlatformManager({ platforms }: Props) {
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleAdd = async (data: PlatformInput) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/profile/creator/platforms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error ?? "Failed to add")
      }
      setAdding(false)
      router.refresh()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to add")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (id: string, data: PlatformInput) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/profile/creator/platforms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...data }),
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error ?? "Failed to update")
      }
      setEditingId(null)
      router.refresh()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to update")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this platform?")) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/profile/creator/platforms?id=${id}`, { method: "DELETE" })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error ?? "Failed to delete")
      }
      router.refresh()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to delete")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Platforms</CardTitle>
        {!adding && (
          <Button variant="outline" size="sm" onClick={() => { setAdding(true); setEditingId(null) }}>
            <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Platform
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <p className="text-sm text-destructive">{error}</p>}

        {platforms.map((p) =>
          editingId === p.id ? (
            <PlatformForm
              key={p.id}
              defaultValues={{
                name: p.name,
                handle: p.handle,
                followersRange: p.followersRange,
                engagementRate: p.engagementRate,
              }}
              onSubmit={(data) => handleUpdate(p.id, data)}
              onCancel={() => setEditingId(null)}
              submitLabel="Save"
              loading={loading}
            />
          ) : (
            <div key={p.id} className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <PlatformBadge platform={p.name} />
                  <span className="text-sm text-muted-foreground">{p.handle}</span>
                </div>
                <p className="text-sm">
                  {p.followersRange} · {p.engagementRate}% engagement
                </p>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => { setEditingId(p.id); setAdding(false) }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(p.id)}
                  disabled={platforms.length <= 1 || loading}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          )
        )}

        {adding && (
          <PlatformForm
            defaultValues={{ name: "", handle: "", followersRange: "", engagementRate: 0 }}
            onSubmit={handleAdd}
            onCancel={() => setAdding(false)}
            submitLabel="Add"
            loading={loading}
          />
        )}
      </CardContent>
    </Card>
  )
}
