"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts"

const COLORS = ["#6366f1", "#3b82f6", "#10b981"]

interface Props {
  funnel: { stage: string; count: number }[]
}

export function ApplicationFunnelChart({ funnel }: Props) {
  const applied = funnel[0]?.count ?? 0
  const shortlisted = funnel[1]?.count ?? 0
  const hired = funnel[2]?.count ?? 0

  const conversionRates = [
    "100%",
    applied > 0 ? `${Math.round((shortlisted / applied) * 100)}% of applied` : "0%",
    shortlisted > 0 ? `${Math.round((hired / shortlisted) * 100)}% of shortlisted` : "0%",
  ]

  const dataWithRate = funnel.map((d, i) => ({ ...d, rate: conversionRates[i] }))

  return (
    <div className="space-y-3">
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={dataWithRate} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 12 }} />
          <YAxis type="category" dataKey="stage" width={80} tick={{ fontSize: 12 }} />
          <Tooltip formatter={(value) => [value, "Count"]} />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            <LabelList dataKey="count" position="right" style={{ fontSize: 12, fontWeight: 600 }} />
            {dataWithRate.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-3 gap-2 text-center border-t pt-3">
        {dataWithRate.map((d, i) => (
          <div key={d.stage}>
            <p className="text-xs text-muted-foreground">{d.stage}</p>
            <p className="text-xs font-semibold" style={{ color: COLORS[i] }}>{d.rate}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
