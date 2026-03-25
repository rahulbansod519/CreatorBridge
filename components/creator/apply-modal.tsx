"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { applicationSchema, type ApplicationInput } from "@/lib/validations"

interface Props {
  campaignId: string
  campaignTitle: string
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ApplyModal({ campaignId, campaignTitle, open, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ApplicationInput>({
    resolver: zodResolver(applicationSchema),
    defaultValues: { campaignId, pitchMessage: "" },
  })

  const onSubmit = handleSubmit(async (data) => {
    setLoading(true)
    setError(null)
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (res.status === 409) {
      setError("You've already applied to this campaign")
      setLoading(false)
      return
    }

    if (!res.ok) {
      const json = await res.json()
      setError(json.error ?? "Failed to submit")
      setLoading(false)
      return
    }

    reset()
    onSuccess()
    onClose()
  })

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Apply to Campaign</DialogTitle>
          <DialogDescription>
            Write a compelling pitch for <strong>{campaignTitle}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Your pitch message</Label>
            <Textarea
              {...register("pitchMessage")}
              placeholder="Describe why you're a great fit for this campaign, your content style, reach, and what you can deliver..."
              rows={6}
            />
            {errors.pitchMessage && <p className="text-xs text-destructive">{errors.pitchMessage.message}</p>}
            <p className="text-xs text-muted-foreground">Minimum 50 characters. Be specific and authentic.</p>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit application"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
