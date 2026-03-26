"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { Pencil, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { creatorProfileUpdateSchema, type CreatorProfileUpdateInput } from "@/lib/validations"
import { NICHES } from "@/lib/constants"

interface Props {
  profile: {
    name: string | null
    bio: string
    niches: string[]
    location: string | null
    mediaKitUrl: string | null
  }
}

export function EditProfileForm({ profile }: Props) {
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const form = useForm<CreatorProfileUpdateInput>({
    resolver: zodResolver(creatorProfileUpdateSchema),
    defaultValues: {
      name: profile.name ?? "",
      bio: profile.bio,
      niches: profile.niches,
      location: profile.location ?? "",
      mediaKitUrl: profile.mediaKitUrl ?? "",
    },
  })

  const selectedNiches = form.watch("niches")

  const onSubmit = form.handleSubmit(async (data) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/profile/creator", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error ?? "Update failed")
      }
      setEditing(false)
      router.refresh()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Update failed")
    } finally {
      setLoading(false)
    }
  })

  const onCancel = () => {
    form.reset()
    setEditing(false)
    setError(null)
  }

  if (!editing) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Profile Info</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Pencil className="h-3.5 w-3.5 mr-1.5" /> Edit
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Name</p>
            <p className="text-sm">{profile.name ?? "—"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Bio</p>
            <p className="text-sm whitespace-pre-wrap">{profile.bio}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Niches</p>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {profile.niches.map((n) => (
                <Badge key={n} variant="secondary">{n}</Badge>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Location</p>
              <p className="text-sm">{profile.location ?? "—"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Media Kit URL</p>
              <p className="text-sm">{profile.mediaKitUrl ?? "—"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Edit Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Bio</Label>
            <Textarea rows={4} {...form.register("bio")} />
            {form.formState.errors.bio && (
              <p className="text-xs text-destructive">{form.formState.errors.bio.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Niches</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {NICHES.map((niche) => (
                <div key={niche} className="flex items-center gap-2">
                  <Checkbox
                    id={`edit-${niche}`}
                    checked={selectedNiches.includes(niche)}
                    onCheckedChange={(checked) => {
                      const current = form.getValues("niches")
                      form.setValue(
                        "niches",
                        checked ? [...current, niche] : current.filter((n) => n !== niche),
                        { shouldValidate: true }
                      )
                    }}
                  />
                  <label htmlFor={`edit-${niche}`} className="text-sm cursor-pointer">{niche}</label>
                </div>
              ))}
            </div>
            {form.formState.errors.niches && (
              <p className="text-xs text-destructive">{form.formState.errors.niches.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Location</Label>
              <Input placeholder="e.g. New York, USA" {...form.register("location")} />
            </div>
            <div className="space-y-2">
              <Label>Media Kit URL</Label>
              <Input placeholder="https://..." {...form.register("mediaKitUrl")} />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={loading} size="sm">
              <Save className="h-3.5 w-3.5 mr-1.5" />
              {loading ? "Saving..." : "Save Changes"}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={loading}>
              <X className="h-3.5 w-3.5 mr-1.5" /> Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
