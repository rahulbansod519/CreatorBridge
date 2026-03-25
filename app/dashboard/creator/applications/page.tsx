import { requireSession } from "@/features/auth/service"
import { getApplicationsForCreator } from "@/features/applications/service"
import { ApplicationsTable } from "@/components/creator/applications-table"

export default async function CreatorApplicationsPage() {
  const user = await requireSession("CREATOR")
  const applications = await getApplicationsForCreator(user.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Applications</h1>
        <p className="text-muted-foreground">Track your campaign applications and responses</p>
      </div>
      <ApplicationsTable applications={applications as never} />
    </div>
  )
}
