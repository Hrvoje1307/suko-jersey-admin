import {
  ORDER_STATUSES,
  orderStatusPrecedes,
  type Order,
  type OrderStatus,
} from '@/entities/order'
import type { ShipmentStep, SupplierShipment } from './types'

export type ShipmentPhase = 'empty' | 'collecting' | 'at_supplier' | 'in_croatia' | 'dispatched'

export const SHIPMENT_PHASE_LABELS: Record<ShipmentPhase, string> = {
  empty: 'Prazna',
  collecting: 'Skuplja se',
  at_supplier: 'Naručeno kod dobavljača',
  in_croatia: 'Stiglo u HR',
  dispatched: 'Razaslano',
}

// Korak na koji pošiljka ide iz pojedine faze.
const NEXT_STEP: Record<ShipmentPhase, ShipmentStep | null> = {
  empty: null,
  collecting: 'sent_to_supplier',
  at_supplier: 'arrived_hr',
  in_croatia: null,
  dispatched: null,
}

export type ShipmentProgress = {
  phase: ShipmentPhase
  /** Broj narudžbi po statusu, samo plaćene. */
  counts: Record<OrderStatus, number>
  /** Narudžbe koje pošiljka ne pomiče (neplaćene, refundirane). */
  skipped: Order[]
  nextStep: ShipmentStep | null
  /** Narudžbe koje idući korak pomiče — i kojima ide email. */
  moving: Order[]
}

// API pomiče samo plaćene narudžbe koje su prije zadanog koraka, pa se faza
// čita po najsporijoj plaćenoj narudžbi.
export function getShipmentProgress(shipment: SupplierShipment): ShipmentProgress {
  const paid = shipment.orders.filter((order) => order.payment_status === 'paid')
  const counts = Object.fromEntries(ORDER_STATUSES.map((status) => [status, 0])) as Record<
    OrderStatus,
    number
  >
  for (const order of paid) counts[order.status]++

  const phase: ShipmentPhase =
    paid.length === 0
      ? 'empty'
      : counts.ordered > 0
        ? 'collecting'
        : counts.sent_to_supplier > 0
          ? 'at_supplier'
          : counts.arrived_hr > 0
            ? 'in_croatia'
            : 'dispatched'

  const nextStep = NEXT_STEP[phase]

  return {
    phase,
    counts,
    skipped: shipment.orders.filter((order) => order.payment_status !== 'paid'),
    nextStep,
    moving: nextStep ? getMovingOrders(shipment.orders, nextStep) : [],
  }
}

export function getMovingOrders(orders: Order[], step: ShipmentStep): Order[] {
  return orders.filter(
    (order) => order.payment_status === 'paid' && orderStatusPrecedes(order.status, step),
  )
}

// Što smije u pošiljku (ista pravila kao SupplierShipmentRequest na API-ju).
export function canJoinShipment(order: Order): boolean {
  return (
    order.payment_status === 'paid' &&
    order.supplier_shipment_id === null &&
    (order.status === 'ordered' || order.status === 'sent_to_supplier')
  )
}

export function formatShipmentName(shipment: Pick<SupplierShipment, 'id'>): string {
  return `Pošiljka #${shipment.id}`
}
