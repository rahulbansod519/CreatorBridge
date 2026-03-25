import { requireSession } from "@/features/auth/service"
import { DashboardShell } from "@/components/shared/dashboard-shell"
import { LayoutDashboard, Users, Megaphone } from "lucide-react"

const navItems = [
  { href: "/dashboard/brand", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: "/dashboard/brand/creators", label: "Find Creators", icon: <Users className="h-4 w-4" /> },
  { href: "/dashboard/brand/campaigns", label: "My Campaigns", icon: <Megaphone className="h-4 w-4" /> },
]

export default async function BrandDashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireSession("BRAND")

  return (
    <DashboardShell user={user} navItems={navItems}>
      {children}
    </DashboardShell>
  )
}
