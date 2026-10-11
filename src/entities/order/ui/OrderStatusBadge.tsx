import { cn } from '@/shared/lib'
import { Badge } from '@/shared/ui'
import { ORDER_STATUS_LABELS, type OrderStatus } from '../model/types'

// Hladnije boje dok je narudžba u obradi, zelena kad je dostavljena.
const STATUS_CLASSES: Record<OrderStatus, string> = {
  ordered: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
  sent_to_supplier: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  arrived_hr: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300',
  shipped: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
  delivered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
}

type OrderStatusBadgeProps = {
  status: OrderStatus
  className?: string
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn('border-transparent', STATUS_CLASSES[status], className)}>
      {ORDER_STATUS_LABELS[status]}
    </Badge>
  )
}
