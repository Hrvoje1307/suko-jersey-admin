import { z } from 'zod'
import { ORDER_STATUSES, PAYMENT_STATUSES, type Order } from '@/entities/order'
import { normalizeSearchText } from '@/shared/lib'

export const PAGE_SIZE = 20

// Bez ?payment= lista skriva neplaćene narudžbe — to su uglavnom napušteni
// checkouti i zatrpali bi listu. "all" ih vraća.
export const PAYMENT_FILTERS = [...PAYMENT_STATUSES, 'all'] as const
export type PaymentFilter = (typeof PAYMENT_FILTERS)[number]

// Sve opcionalno i s .catch — ručno pokvaren URL pada na default umjesto
// na error stranicu, a link na /narudzbe ne mora slati nijedan param.
export const ordersSearchSchema = z.object({
  q: z.string().trim().min(1).optional().catch(undefined),
  status: z.enum(ORDER_STATUSES).optional().catch(undefined),
  payment: z.enum(PAYMENT_FILTERS).optional().catch(undefined),
  page: z.number().int().min(1).optional().catch(undefined),
})
export type OrdersSearch = z.infer<typeof ordersSearchSchema>

export type OrdersSearchChange = (patch: Partial<OrdersSearch>) => void

// Natrag na default, uključujući skrivanje neplaćenih.
export const CLEARED_FILTERS = {
  q: undefined,
  status: undefined,
  payment: undefined,
  page: undefined,
} satisfies Partial<OrdersSearch>

export function hasActiveFilters({ q, status, payment }: OrdersSearch): boolean {
  return Boolean(q || status || payment)
}

function matchesPayment(order: Order, payment: PaymentFilter | undefined): boolean {
  if (payment === undefined) return order.payment_status !== 'unpaid'
  return payment === 'all' || order.payment_status === payment
}

// API već vraća najnovije prvo, pa redoslijed ostaje netaknut.
export function filterOrders(orders: Order[], search: OrdersSearch): Order[] {
  const needle = search.q ? normalizeSearchText(search.q) : null

  return orders.filter(
    (order) =>
      matchesPayment(order, search.payment) &&
      (!search.status || order.status === search.status) &&
      (!needle ||
        normalizeSearchText(order.order_reference).includes(needle) ||
        normalizeSearchText(order.customer.email).includes(needle)),
  )
}

// Koliko bi neplaćenih prošlo ostale filtere — za poruku "skriveno N".
export function countHiddenUnpaid(orders: Order[], search: OrdersSearch): number {
  if (search.payment !== undefined) return 0
  return filterOrders(orders, { ...search, payment: 'unpaid' }).length
}
