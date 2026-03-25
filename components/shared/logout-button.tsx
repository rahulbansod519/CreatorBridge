"use client"

import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export function LogoutButton() {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="w-full justify-start text-muted-foreground hover:text-foreground"
      onClick={async () => {
        await signOut({ redirect: false })
        window.location.href = "/"
      }}
    >
      <LogOut className="mr-2 h-4 w-4" />
      Sign out
    </Button>
  )
}
