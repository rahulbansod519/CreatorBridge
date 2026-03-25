import { Badge } from "@/components/ui/badge"
import { STATUS_COLORS } from "@/lib/constants"
import { cn } from "@/lib/utils"

type Status = keyof typeof STATUS_COLORS

interface StatusBadgeProps {
  status: Status
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(STATUS_COLORS[status], "font-medium capitalize", className)}
    >
      {status.toLowerCase().replace("_", " ")}
    </Badge>
  )
}
