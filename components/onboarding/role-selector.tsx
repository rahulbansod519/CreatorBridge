"use client"

import { useRouter } from "next/navigation"
import { Zap, Building2, UserCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function RoleSelector() {
  const router = useRouter()

  return (
    <div className="w-full max-w-2xl space-y-8 text-center">
      <div>
        <div className="flex items-center justify-center gap-2 mb-4">
          <Zap className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">CreatorBridge</span>
        </div>
        <h1 className="text-3xl font-bold">How will you use CreatorBridge?</h1>
        <p className="text-muted-foreground mt-2">Choose your role to get started. You can always update this later.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card
          className="cursor-pointer border-2 hover:border-primary transition-colors group"
          onClick={() => router.push("/onboarding/creator")}
        >
          <CardContent className="p-8 space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-primary/10 p-4 group-hover:bg-primary/20 transition-colors">
                <UserCircle className="h-10 w-10 text-primary" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold">I&apos;m a Creator</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Influencer or content creator looking for brand partnerships and sponsorships
              </p>
            </div>
            <Button className="w-full">Get started as Creator</Button>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer border-2 hover:border-primary transition-colors group"
          onClick={() => router.push("/onboarding/brand")}
        >
          <CardContent className="p-8 space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-primary/10 p-4 group-hover:bg-primary/20 transition-colors">
                <Building2 className="h-10 w-10 text-primary" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold">I&apos;m a Brand</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Business or company looking to run creator campaigns and find the right talent
              </p>
            </div>
            <Button variant="outline" className="w-full">Get started as Brand</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
