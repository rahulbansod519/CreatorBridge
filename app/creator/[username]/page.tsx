import { notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { getCreatorByUsername } from "@/features/profiles/service"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlatformBadge } from "@/components/shared/platform-badge"
import { MapPin, Download, ExternalLink } from "lucide-react"
import Link from "next/link"

export default async function CreatorProfilePage({ params }: { params: { username: string } }) {
  const [creator, session] = await Promise.all([
    getCreatorByUsername(params.username),
    auth(),
  ])

  if (!creator || !creator.creatorProfile) notFound()

  const profile = creator.creatorProfile
  const platforms = profile.platforms
  const avgEngagement = platforms.length
    ? (platforms.reduce((s, p) => s + p.engagementRate, 0) / platforms.length).toFixed(1)
    : "0"
  const initials = (creator.name ?? creator.email ?? "U").split(" ").map((s) => s[0]).join("").toUpperCase().slice(0, 2)
  const isBrand = session?.user?.role === "BRAND"

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg flex items-center gap-2">
            <span className="text-primary">⚡</span> CreatorBridge
          </Link>
          {!session && (
            <div className="flex gap-2">
              <Button variant="ghost" asChild><Link href="/login">Sign in</Link></Button>
              <Button asChild><Link href="/register">Get started</Link></Button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        {/* Hero */}
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <Avatar className="h-24 w-24 sm:h-28 sm:w-28">
            <AvatarImage src={creator.image ?? ""} />
            <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-3">
            <div>
              <h1 className="text-3xl font-bold">{creator.name}</h1>
              {profile.location && (
                <p className="text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="h-4 w-4" /> {profile.location}
                </p>
              )}
            </div>
            <p className="text-muted-foreground leading-relaxed">{profile.bio}</p>
            <div className="flex flex-wrap gap-2">
              {profile.niches.map((n) => (
                <Badge key={n} variant="secondary">{n}</Badge>
              ))}
            </div>
            {isBrand && (
              <Button>
                <ExternalLink className="h-4 w-4 mr-2" /> Invite to Campaign
              </Button>
            )}
          </div>
        </div>

        {/* Media Kit Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Media Kit
              {profile.mediaKitUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a href={profile.mediaKitUrl} target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4 mr-2" /> Download PDF
                  </a>
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{platforms.length}</p>
                <p className="text-xs text-muted-foreground">Platforms</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{avgEngagement}%</p>
                <p className="text-xs text-muted-foreground">Avg. Engagement</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{platforms.length}</p>
                <p className="text-xs text-muted-foreground">Platforms</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{profile.niches.length}</p>
                <p className="text-xs text-muted-foreground">Niches</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Platform cards */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Platforms</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {platforms.map((p) => (
              <Card key={p.id}>
                <CardContent className="p-5 space-y-2">
                  <PlatformBadge platform={p.name} />
                  <p className="text-sm text-muted-foreground">{p.handle}</p>
                  <p className="text-2xl font-bold">{p.followersRange}</p>
                  <p className="text-xs text-muted-foreground">{p.engagementRate}% engagement rate</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
