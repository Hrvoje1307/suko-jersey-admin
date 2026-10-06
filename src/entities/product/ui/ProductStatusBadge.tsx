import { cn } from '@/shared/lib'
import { Badge } from '@/shared/ui'
import { STATUS_LABELS, type ProductStatus } from '../model/types'

const STATUS_CLASSES: Record<ProductStatus, string> = {
  active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  draft: 'bg-muted text-muted-foreground',
  sold_out: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
}

type ProductStatusBadgeProps = {
  status: ProductStatus
  className?: string
}

export function ProductStatusBadge({ status, className }: ProductStatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn('border-transparent', STATUS_CLASSES[status], className)}>
      {STATUS_LABELS[status]}
    </Badge>
  )
}
