"use client"

import { CheckCircle2, Circle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

interface Profile {
  bio: string
  location: string | null
  mediaKitUrl: string | null
  niches: string[]
}

interface Props {
  profile: Profile | null
  platformCount: number
}

export function ProfileCompleteness({ profile, platformCount }: Props) {
  const items = [
    { label: "Bio written", done: !!profile?.bio },
    { label: "Location set", done: !!profile?.location },
    { label: "Media Kit", done: !!profile?.mediaKitUrl },
    { label: "2+ Niches", done: (profile?.niches?.length ?? 0) >= 2 },
    { label: "2+ Platforms", done: platformCount >= 2 },
  ]
  const completed = items.filter((i) => i.done).length
  const pct = Math.round((completed / items.length) * 100)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          Profile Completeness
          <span className="text-lg font-bold">{pct}%</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-1">
          {items.map((item) => (
            <div
              key={item.label}
              className={`flex items-center gap-1 text-xs ${
                item.done ? "text-green-500" : "text-muted-foreground"
              }`}
            >
              {item.done ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : (
                <Circle className="h-3 w-3" />
              )}
              {item.label}
            </div>
          ))}
        </div>
        {pct < 100 && (
          <p className="text-xs text-muted-foreground">
            A complete profile gets more brand invites.{" "}
            <Link
              href="/dashboard/creator/profile"
              className="underline text-primary"
            >
              Update profile →
            </Link>
          </p>
        )}
      </CardContent>
    </Card>
  )
}
