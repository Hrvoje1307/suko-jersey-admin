import { cn } from '@/shared/lib'
import { Badge } from '@/shared/ui'
import { ORDER_STATUS_LABELS, type OrderStatus } from '../model/types'
import { ORDER_STATUS_BADGE_CLASSES } from './status-badge-classes'

type OrderStatusBadgeProps = {
  status: OrderStatus
  className?: string
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn('border-transparent', ORDER_STATUS_BADGE_CLASSES[status], className)}
    >
      {ORDER_STATUS_LABELS[status]}
    </Badge>
  )
}
