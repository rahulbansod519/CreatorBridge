"use client"

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { creatorOnboardingSchema, type CreatorOnboardingInput } from "@/lib/validations"
import { NICHES, PLATFORMS, PLATFORM_LABELS, FOLLOWER_RANGES } from "@/lib/constants"

const FOLLOWER_LABEL: Record<string, string> = {
  youtube: "Subscribers",
  instagram: "Followers",
  tiktok: "Followers",
  twitter: "Followers",
  linkedin: "Connections",
}

const STEP_FIELDS: (keyof CreatorOnboardingInput)[][] = [
  ["bio", "niches"],
  ["platforms"],
  [],
]

const STEPS = ["Profile", "Platforms", "Finish"]

export function CreatorOnboarding() {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { update } = useSession()
  const router = useRouter()

  const form = useForm<CreatorOnboardingInput>({
    resolver: zodResolver(creatorOnboardingSchema),
    defaultValues: { bio: "", niches: [], location: "", platforms: [{ name: "", handle: "", followersRange: "", engagementRate: 0 }], mediaKitUrl: "" },
  })

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "platforms" })

  const goNext = async () => {
    const valid = await form.trigger(STEP_FIELDS[step] as (keyof CreatorOnboardingInput)[])
    if (valid) setStep((s) => s + 1)
  }

  const onSubmit = form.handleSubmit(async (data) => {
    setLoading(true)
    setError(null)
    const res = await fetch("/api/onboarding/creator", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const json = await res.json()
      setError(json.error ?? "Setup failed")
      setLoading(false)
      return
    }

    await update() // refresh JWT with new role
    window.location.href = "/dashboard/creator"
  })

  const selectedNiches = form.watch("niches")

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Step indicator */}
      <div className="flex items-center justify-between">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              {i + 1}
            </div>
            <span className={`text-sm hidden sm:block ${i === step ? "font-medium" : "text-muted-foreground"}`}>{label}</span>
            {i < STEPS.length - 1 && <div className={`h-px w-12 sm:w-20 ${i < step ? "bg-primary" : "bg-border"}`} />}
          </div>
        ))}
      </div>

      <Card>
        {step === 0 && (
          <>
            <CardHeader>
              <CardTitle>Tell us about yourself</CardTitle>
              <CardDescription>Your bio and niche help brands find you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea placeholder="Tell brands about yourself, your content style, and what makes you unique..." rows={4} {...form.register("bio")} />
                {form.formState.errors.bio && <p className="text-xs text-destructive">{form.formState.errors.bio.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Location (optional)</Label>
                <Input placeholder="e.g. New York, USA" {...form.register("location")} />
              </div>
              <div className="space-y-2">
                <Label>Niche Categories <span className="text-destructive">*</span></Label>
                <p className="text-xs text-muted-foreground">Select all that apply</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {NICHES.map((niche) => (
                    <div key={niche} className="flex items-center gap-2">
                      <Checkbox
                        id={niche}
                        checked={selectedNiches.includes(niche)}
                        onCheckedChange={(checked) => {
                          const current = form.getValues("niches")
                          form.setValue("niches", checked ? [...current, niche] : current.filter((n) => n !== niche))
                        }}
                      />
                      <label htmlFor={niche} className="text-sm cursor-pointer">{niche}</label>
                    </div>
                  ))}
                </div>
                {form.formState.errors.niches && <p className="text-xs text-destructive">{form.formState.errors.niches.message}</p>}
              </div>
            </CardContent>
          </>
        )}

        {step === 1 && (
          <>
            <CardHeader>
              <CardTitle>Your social platforms</CardTitle>
              <CardDescription>Add your platforms and audience stats</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, i) => (
                <div key={field.id} className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Platform {i + 1}</p>
                    {fields.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => remove(i)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Platform</Label>
                      <Select onValueChange={(v) => form.setValue(`platforms.${i}.name`, v)} defaultValue={field.name}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          {PLATFORMS.map((p) => (
                            <SelectItem key={p} value={p}>{PLATFORM_LABELS[p]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Handle</Label>
                      <Input placeholder="@yourhandle" {...form.register(`platforms.${i}.handle`)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">{FOLLOWER_LABEL[form.watch(`platforms.${i}.name`)] ?? "Followers"}</Label>
                      <Select onValueChange={(v) => form.setValue(`platforms.${i}.followersRange`, v)} defaultValue={field.followersRange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select range..." />
                        </SelectTrigger>
                        <SelectContent>
                          {FOLLOWER_RANGES.map((r) => (
                            <SelectItem key={r} value={r}>{r}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.platforms?.[i]?.followersRange && (
                        <p className="text-xs text-destructive">{form.formState.errors.platforms[i]?.followersRange?.message}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Engagement %</Label>
                      <Input type="number" step="0.1" placeholder="4.5" {...form.register(`platforms.${i}.engagementRate`)} />
                    </div>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" className="w-full" onClick={() => append({ name: "", handle: "", followersRange: "", engagementRate: 0 })}>
                <Plus className="h-4 w-4 mr-2" /> Add another platform
              </Button>
              {form.formState.errors.platforms && <p className="text-xs text-destructive">{form.formState.errors.platforms.message}</p>}
            </CardContent>
          </>
        )}

        {step === 2 && (
          <>
            <CardHeader>
              <CardTitle>Almost done!</CardTitle>
              <CardDescription>Review your profile and complete setup</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted p-4 space-y-2 text-sm">
                <div><span className="font-medium">Bio:</span> {form.getValues("bio").slice(0, 100)}...</div>
                <div><span className="font-medium">Niches:</span> {form.getValues("niches").join(", ")}</div>
                <div><span className="font-medium">Platforms:</span> {form.getValues("platforms").filter(p => p.name).map(p => `${PLATFORM_LABELS[p.name] ?? p.name} (${p.handle})`).join(", ")}</div>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </CardContent>
          </>
        )}

        <div className="flex justify-between p-6 pt-0">
          <Button type="button" variant="outline" onClick={() => setStep((s) => s - 1)} disabled={step === 0}>
            Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={goNext}>Next</Button>
          ) : (
            <Button onClick={onSubmit} disabled={loading} type="button">
              {loading ? "Setting up..." : "Complete setup"}
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
