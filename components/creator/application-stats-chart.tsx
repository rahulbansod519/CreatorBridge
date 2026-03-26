"use client"

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts"

const COLORS: Record<string, string> = {
  PENDING: "#f59e0b",
  SHORTLISTED: "#3b82f6",
  HIRED: "#10b981",
  REJECTED: "#ef4444",
}

const LABELS: Record<string, string> = {
  PENDING: "Pending",
  SHORTLISTED: "Shortlisted",
  HIRED: "Hired",
  REJECTED: "Rejected",
}

interface Props {
  appStats: { pending: number; shortlisted: number; hired: number; rejected: number }
}

export function ApplicationStatsChart({ appStats }: Props) {
  const data = [
    { key: "PENDING", value: appStats.pending },
    { key: "SHORTLISTED", value: appStats.shortlisted },
    { key: "HIRED", value: appStats.hired },
    { key: "REJECTED", value: appStats.rejected },
  ].filter((d) => d.value > 0)

  if (data.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground py-12">
        No applications yet
      </p>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={75}
          dataKey="value"
          nameKey="key"
        >
          {data.map((entry) => (
            <Cell key={entry.key} fill={COLORS[entry.key]} />
          ))}
        </Pie>
        <Tooltip formatter={(value, key) => [value, LABELS[key as string] ?? key]} />
        <Legend formatter={(key) => LABELS[key as string] ?? key} />
      </PieChart>
    </ResponsiveContainer>
  )
}
