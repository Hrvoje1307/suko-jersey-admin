import { Link } from '@tanstack/react-router'
import { Loader2Icon, PlusIcon, RotateCwIcon, XIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import {
  countPieces,
  OrderStatusBadge,
  PaymentStatusBadge,
  useAdminOrders,
  type Order,
} from '@/entities/order'
import { canJoinShipment } from '@/entities/supplier-shipment'
import { formatCount, formatDate } from '@/shared/lib'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
} from '@/shared/ui'
import type { SupplierShipmentFormApi } from '../model/useSupplierShipmentForm'

const ORDER_FORMS = { one: 'narudžba', few: 'narudžbe', other: 'narudžbi' }
const PIECE_FORMS = { one: 'komad', few: 'komada', other: 'komada' }

type ShipmentOrdersSectionProps = {
  form: SupplierShipmentFormApi
  /** Narudžbe kakve su spremljene u pošiljci (prazno kod nove). */
  savedOrders: Order[]
}

export function ShipmentOrdersSection({ form, savedOrders }: ShipmentOrdersSectionProps) {
  const ordersQuery = useAdminOrders()

  // Spremljene članice iz pošiljke, pa svježije stanje iz liste narudžbi.
  const byId = new Map<number, Order>()
  for (const order of savedOrders) byId.set(order.id, order)
  for (const order of ordersQuery.data ?? []) byId.set(order.id, order)
  const savedIds = new Set(savedOrders.map((order) => order.id))

  return (
    <form.Field name="order_ids">
      {(field) => {
        const ids = new Set(field.state.value)
        const selected = sortOldestFirst(
          field.state.value.flatMap((id) => byId.get(id) ?? []),
        )
        // Uklonjena spremljena članica ostaje ponuđena — do spremanja se može vratiti.
        const candidates = sortOldestFirst(
          [...byId.values()].filter(
            (order) => !ids.has(order.id) && (savedIds.has(order.id) || canJoinShipment(order)),
          ),
        )
        const pieces = selected.reduce((sum, order) => sum + countPieces(order), 0)
        const error = field.state.meta.errors[0]?.message

        return (
          <Card>
            <CardHeader>
              <CardTitle>Narudžbe u pošiljci</CardTitle>
              <CardDescription>
                {selected.length > 0
                  ? `${formatCount(selected.length, ORDER_FORMS)} · ${formatCount(pieces, PIECE_FORMS)}`
                  : 'Dodaj narudžbe koje zajedno naručuješ kod dobavljača.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              {selected.length > 0 && (
                <OrderRows
                  orders={selected}
                  renderTag={(order) => !savedIds.has(order.id) && <Badge variant="secondary">Novo</Badge>}
                  renderAction={(order) => (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      aria-label={`Ukloni ${order.order_reference} iz pošiljke`}
                      onClick={() =>
                        field.handleChange(field.state.value.filter((id) => id !== order.id))
                      }
                    >
                      <XIcon />
                      Ukloni
                    </Button>
                  )}
                />
              )}
              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}

              <div className="grid gap-3">
                <div>
                  <h3 className="text-sm font-medium">Mogu u pošiljku</h3>
                  <p className="text-sm text-muted-foreground">
                    Plaćene narudžbe koje još nisu stigle u HR i nisu u drugoj pošiljci. Najstarije
                    prve.
                  </p>
                </div>
                {ordersQuery.isPending ? (
                  <div className="grid gap-2" aria-busy="true" aria-label="Učitavanje narudžbi">
                    <Skeleton className="h-12" />
                    <Skeleton className="h-12" />
                  </div>
                ) : ordersQuery.isError && !ordersQuery.data ? (
                  <div role="alert" className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="text-destructive">Narudžbe se nisu učitale.</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={ordersQuery.isFetching}
                      onClick={() => void ordersQuery.refetch()}
                    >
                      {ordersQuery.isFetching ? <Loader2Icon className="animate-spin" /> : <RotateCwIcon />}
                      Pokušaj ponovno
                    </Button>
                  </div>
                ) : candidates.length === 0 ? (
                  <p className="rounded-md border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                    Nema narudžbi koje čekaju pošiljku.
                  </p>
                ) : (
                  <OrderRows
                    orders={candidates}
                    renderTag={(order) =>
                      savedIds.has(order.id) && <Badge variant="outline">Uklonjena</Badge>
                    }
                    renderAction={(order) => (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        aria-label={`Dodaj ${order.order_reference} u pošiljku`}
                        onClick={() => field.handleChange([...field.state.value, order.id])}
                      >
                        <PlusIcon />
                        Dodaj
                      </Button>
                    )}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        )
      }}
    </form.Field>
  )
}

type OrderRowsProps = {
  orders: Order[]
  renderTag: (order: Order) => ReactNode
  renderAction: (order: Order) => ReactNode
}

function OrderRows({ orders, renderTag, renderAction }: OrderRowsProps) {
  return (
    <ul className="divide-y rounded-md border">
      {orders.map((order) => (
        <li key={order.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-3 py-2">
          <div className="grid min-w-40 flex-1 gap-0.5">
            <div className="flex flex-wrap items-center gap-2">
              {/* Nova kartica — klik ne smije baciti nespremljene izmjene pošiljke. */}
              <Link
                to="/narudzbe/$id"
                params={{ id: String(order.id) }}
                target="_blank"
                className="font-mono text-sm font-medium hover:underline"
              >
                {order.order_reference}
              </Link>
              {renderTag(order)}
            </div>
            <span className="text-sm text-muted-foreground">
              {order.customer.name} · {formatDate(order.created_at)} ·{' '}
              {formatCount(countPieces(order), PIECE_FORMS)}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <OrderStatusBadge status={order.status} />
            {order.payment_status !== 'paid' && <PaymentStatusBadge status={order.payment_status} />}
          </div>
          {renderAction(order)}
        </li>
      ))}
    </ul>
  )
}

function sortOldestFirst(orders: Order[]): Order[] {
  return [...orders].sort((a, b) => a.id - b.id)
}
