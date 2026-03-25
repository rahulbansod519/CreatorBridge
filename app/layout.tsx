import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { NextAuthSessionProvider } from "@/components/shared/session-provider"
import { ThemeProvider } from "@/components/shared/theme-provider"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CreatorBridge — Connect Creators with Brands",
  description: "The marketplace where creators and brands meet for authentic sponsorships and campaigns.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <NextAuthSessionProvider>
            {children}
          </NextAuthSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
