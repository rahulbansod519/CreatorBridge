import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, Search, BarChart2, Handshake, ArrowRight, Star, TrendingUp, Users } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">CreatorBridge</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild><Link href="/login">Sign in</Link></Button>
            <Button asChild><Link href="/register">Get started free</Link></Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-24 text-center space-y-8">
        <Badge variant="secondary" className="text-sm px-4 py-1">
          🚀 The Creator-Brand Marketplace
        </Badge>
        <h1 className="text-5xl sm:text-6xl font-bold leading-tight">
          Where creators meet<br />
          <span className="text-primary">brands that convert</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          CreatorBridge connects authentic content creators with brands ready to invest.
          Launch campaigns, discover talent, and grow together.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="text-base px-8" asChild>
            <Link href="/register">
              Start as Creator <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="text-base px-8" asChild>
            <Link href="/register">Find Creators for Your Brand</Link>
          </Button>
        </div>
        <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground pt-4">
          <div className="flex items-center gap-2"><Users className="h-4 w-4" /> 5K+ Creators</div>
          <div className="flex items-center gap-2"><Handshake className="h-4 w-4" /> 500+ Brands</div>
          <div className="flex items-center gap-2"><Star className="h-4 w-4" /> $2M+ in Deals</div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted/30 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">How it works</h2>
            <p className="text-muted-foreground mt-2">Get from signup to sponsored in days, not months</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: "1", icon: <Search className="h-6 w-6" />, title: "Create your profile", desc: "Creators showcase platforms & stats. Brands list their company and campaigns." },
              { step: "2", icon: <Handshake className="h-6 w-6" />, title: "Connect & Apply", desc: "Creators discover active campaigns and apply with a pitch. Brands find and invite creators." },
              { step: "3", icon: <TrendingUp className="h-6 w-6" />, title: "Collaborate & Grow", desc: "Brands manage applicants, track campaigns, and hire the perfect creator." },
            ].map((item) => (
              <Card key={item.step} className="relative overflow-hidden">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      {item.icon}
                    </div>
                    <span className="text-4xl font-bold text-muted-foreground/20">{item.step}</span>
                  </div>
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Built for creators and brands</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-primary flex items-center gap-2">
              <Users className="h-5 w-5" /> For Creators
            </h3>
            {[
              "Analytics dashboard with follower growth charts",
              "Campaign discovery feed filtered by your niche",
              "Track applications & brand responses in one place",
              "Public media kit page to share with brands",
            ].map((f) => (
              <div key={f} className="flex items-center gap-3 text-sm">
                <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                {f}
              </div>
            ))}
          </div>
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-primary flex items-center gap-2">
              <BarChart2 className="h-5 w-5" /> For Brands
            </h3>
            {[
              "Searchable creator database with filter by niche & platform",
              "Campaign manager with applicant tracking",
              "Direct messaging and status management",
              "Brand analytics: applications, hires, top niches",
            ].map((f) => (
              <div key={f} className="flex items-center gap-3 text-sm">
                <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="max-w-3xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl font-bold">Ready to bridge the gap?</h2>
          <p className="text-primary-foreground/80 text-lg">
            Join thousands of creators and brands building authentic partnerships.
          </p>
          <Button size="lg" variant="secondary" className="text-base px-10" asChild>
            <Link href="/register">Get started free — no credit card needed</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <span className="font-semibold">CreatorBridge</span>
            <span>© 2026</span>
          </div>
          <div className="flex gap-6">
            <Link href="/login" className="hover:text-foreground">Sign in</Link>
            <Link href="/register" className="hover:text-foreground">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
