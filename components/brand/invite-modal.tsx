"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { inviteSchema, type InviteInput } from "@/lib/validations"

interface Props {
  creatorId: string
  creatorName: string
  campaigns: { id: string; title: string }[]
  open: boolean
  onClose: () => void
}

export function InviteModal({ creatorId, creatorName, campaigns, open, onClose }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm<InviteInput>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { creatorId, campaignId: "", message: "" },
  })

  const onSubmit = handleSubmit(async (data) => {
    setLoading(true)
    setError(null)
    const res = await fetch("/api/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      setError((await res.json()).error ?? "Failed")
      setLoading(false)
      return
    }
    setSuccess(true)
    setTimeout(() => { setSuccess(false); reset(); onClose() }, 1500)
  })

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite to Campaign</DialogTitle>
          <DialogDescription>Send an invite to <strong>{creatorName}</strong></DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-6 text-center text-green-500 font-medium">Invite sent successfully!</div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Campaign</Label>
              <Select onValueChange={(v) => setValue("campaignId", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a campaign..." />
                </SelectTrigger>
                <SelectContent>
                  {campaigns.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.campaignId && <p className="text-xs text-destructive">{errors.campaignId.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea {...register("message")} placeholder="Tell the creator why you'd like to work with them..." rows={4} />
              {errors.message && <p className="text-xs text-destructive">{errors.message.message}</p>}
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={loading}>{loading ? "Sending..." : "Send invite"}</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
