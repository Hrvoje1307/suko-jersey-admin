import { cn } from '@/shared/lib'
import { Badge } from '@/shared/ui'
import { PAYMENT_STATUS_LABELS, type PaymentStatus } from '../model/types'

const STATUS_CLASSES: Record<PaymentStatus, string> = {
  paid: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  // Neplaćeno je najčešće napušten checkout — prigušeno, ne alarmantno.
  unpaid: 'bg-muted text-muted-foreground',
  failed: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
  refunded: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
}

type PaymentStatusBadgeProps = {
  status: PaymentStatus
  className?: string
}

export function PaymentStatusBadge({ status, className }: PaymentStatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn('border-transparent', STATUS_CLASSES[status], className)}>
      {PAYMENT_STATUS_LABELS[status]}
    </Badge>
  )
}
