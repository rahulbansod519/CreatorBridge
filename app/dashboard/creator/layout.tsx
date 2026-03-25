import { requireSession } from "@/features/auth/service"
import { DashboardShell } from "@/components/shared/dashboard-shell"
import { LayoutDashboard, Search, FileText, User } from "lucide-react"

const navItems = [
  { href: "/dashboard/creator", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: "/dashboard/creator/campaigns", label: "Discover Campaigns", icon: <Search className="h-4 w-4" /> },
  { href: "/dashboard/creator/applications", label: "My Applications", icon: <FileText className="h-4 w-4" /> },
]

export default async function CreatorDashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireSession("CREATOR")

  return (
    <DashboardShell user={user} navItems={navItems}>
      {children}
    </DashboardShell>
  )
}
