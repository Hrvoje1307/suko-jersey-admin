import { ORDER_STATUS_BADGE_CLASSES } from '@/entities/order'
import { cn } from '@/shared/lib'
import { Badge } from '@/shared/ui'
import { SHIPMENT_PHASE_LABELS, type ShipmentPhase } from '../model/progress'

// Iste boje kao status narudžbe u kojem pošiljka stoji.
const PHASE_CLASSES: Record<ShipmentPhase, string> = {
  empty: 'bg-muted text-muted-foreground',
  collecting: ORDER_STATUS_BADGE_CLASSES.ordered,
  at_supplier: ORDER_STATUS_BADGE_CLASSES.sent_to_supplier,
  in_croatia: ORDER_STATUS_BADGE_CLASSES.arrived_hr,
  dispatched: ORDER_STATUS_BADGE_CLASSES.delivered,
}

type ShipmentPhaseBadgeProps = {
  phase: ShipmentPhase
  className?: string
}

export function ShipmentPhaseBadge({ phase, className }: ShipmentPhaseBadgeProps) {
  return (
    <Badge variant="outline" className={cn('border-transparent', PHASE_CLASSES[phase], className)}>
      {SHIPMENT_PHASE_LABELS[phase]}
    </Badge>
  )
}
