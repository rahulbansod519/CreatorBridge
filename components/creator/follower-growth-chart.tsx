"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import type { GrowthDataPoint } from "@/lib/mock-data"
import { PLATFORM_COLORS } from "@/lib/constants"

const LINE_COLORS: Record<string, string> = {
  instagram: "#ec4899",
  youtube: "#ef4444",
  tiktok: "#a855f7",
  twitter: "#0ea5e9",
  linkedin: "#3b82f6",
}

interface Props {
  data: GrowthDataPoint[]
  platforms: string[]
}

export function FollowerGrowthChart({ data, platforms }: Props) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} className="text-muted-foreground" />
        <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} />
        <Tooltip formatter={(v: number) => v.toLocaleString()} />
        <Legend />
        {platforms.map((p) => (
          <Line
            key={p}
            type="monotone"
            dataKey={p}
            stroke={LINE_COLORS[p] ?? "#6366f1"}
            strokeWidth={2}
            dot={false}
            name={p.charAt(0).toUpperCase() + p.slice(1)}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
