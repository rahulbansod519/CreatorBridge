import { Badge } from "@/components/ui/badge"
import { PLATFORM_COLORS, PLATFORM_LABELS } from "@/lib/constants"
import { cn } from "@/lib/utils"

interface PlatformBadgeProps {
  platform: string
  className?: string
}

export function PlatformBadge({ platform, className }: PlatformBadgeProps) {
  const colorClass = PLATFORM_COLORS[platform.toLowerCase()] ?? "bg-gray-500/20 text-gray-400 border-gray-500/30"
  const label = PLATFORM_LABELS[platform.toLowerCase()] ?? platform

  return (
    <Badge variant="outline" className={cn(colorClass, "font-medium text-xs", className)}>
      {label}
    </Badge>
  )
}
