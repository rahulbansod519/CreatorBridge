import { requireSession } from "@/features/auth/service"
import { CampaignForm } from "@/components/brand/campaign-form"

export default async function NewCampaignPage() {
  await requireSession("BRAND")
  return (
    <div className="max-w-2xl">
      <CampaignForm />
    </div>
  )
}
