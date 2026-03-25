"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { brandOnboardingSchema, type BrandOnboardingInput } from "@/lib/validations"
import { INDUSTRIES } from "@/lib/constants"

const STEPS = ["Company Info", "Confirm"]

export function BrandOnboarding() {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { update } = useSession()
  const router = useRouter()

  const form = useForm<BrandOnboardingInput>({
    resolver: zodResolver(brandOnboardingSchema),
    defaultValues: { companyName: "", industry: "", website: "" },
  })

  const goNext = async () => {
    const valid = await form.trigger(["companyName", "industry", "website"])
    if (valid) setStep(1)
  }

  const onSubmit = form.handleSubmit(async (data) => {
    setLoading(true)
    setError(null)
    const res = await fetch("/api/onboarding/brand", {
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

    await update()
    window.location.href = "/dashboard/brand"
  })

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-4">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              {i + 1}
            </div>
            <span className={`text-sm ${i === step ? "font-medium" : "text-muted-foreground"}`}>{label}</span>
            {i < STEPS.length - 1 && <div className={`h-px w-16 ${i < step ? "bg-primary" : "bg-border"}`} />}
          </div>
        ))}
      </div>

      <Card>
        {step === 0 && (
          <>
            <CardHeader>
              <CardTitle>Company information</CardTitle>
              <CardDescription>Tell creators about your brand</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Company name</Label>
                <Input placeholder="Acme Corp" {...form.register("companyName")} />
                {form.formState.errors.companyName && <p className="text-xs text-destructive">{form.formState.errors.companyName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Industry</Label>
                <Select onValueChange={(v) => form.setValue("industry", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry..." />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map((ind) => (
                      <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.industry && <p className="text-xs text-destructive">{form.formState.errors.industry.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Website</Label>
                <Input type="url" placeholder="https://yourcompany.com" {...form.register("website")} />
                {form.formState.errors.website && <p className="text-xs text-destructive">{form.formState.errors.website.message}</p>}
              </div>
            </CardContent>
          </>
        )}

        {step === 1 && (
          <>
            <CardHeader>
              <CardTitle>Ready to launch!</CardTitle>
              <CardDescription>Review your brand profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted p-4 space-y-2 text-sm">
                <div><span className="font-medium">Company:</span> {form.getValues("companyName")}</div>
                <div><span className="font-medium">Industry:</span> {form.getValues("industry")}</div>
                <div><span className="font-medium">Website:</span> {form.getValues("website")}</div>
              </div>
              <p className="text-sm text-muted-foreground">Once you confirm, you can start creating campaigns and discovering creators right away.</p>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </CardContent>
          </>
        )}

        <div className="flex justify-between p-6 pt-0">
          <Button type="button" variant="outline" onClick={() => setStep(0)} disabled={step === 0}>Back</Button>
          {step === 0 ? (
            <Button type="button" onClick={goNext}>Next</Button>
          ) : (
            <Button onClick={onSubmit} disabled={loading}>
              {loading ? "Setting up..." : "Complete setup"}
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
