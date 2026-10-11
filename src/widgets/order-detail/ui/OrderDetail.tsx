import { Link } from '@tanstack/react-router'
import { ArrowLeftIcon, Loader2Icon, RotateCwIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import {
  OrderStatusBadge,
  PaymentStatusBadge,
  useAdminOrder,
  type OrderDetail as OrderDetailData,
} from '@/entities/order'
import { UpdateOrderStatusForm } from '@/features/update-order-status'
import { isApiError } from '@/shared/api'
import { formatCountry, formatCurrency, formatDateTime } from '@/shared/lib'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui'

type OrderDetailProps = {
  orderId: number
}

export function OrderDetail({ orderId }: OrderDetailProps) {
  const { data: order, error, isPending, isError, isFetching, refetch } = useAdminOrder(orderId)

  if (isPending) {
    return (
      <DetailLayout title="Narudžba">
        <DetailSkeleton />
      </DetailLayout>
    )
  }

  if (isError) {
    if (isApiError(error) && error.response?.status === 404) {
      return <OrderNotFound />
    }
    const offline = isApiError(error) && !error.response
    return (
      <DetailLayout title="Narudžba">
        <div
          role="alert"
          className="flex flex-col items-center gap-3 rounded-md border border-destructive/30 bg-destructive/5 px-6 py-12 text-center"
        >
          <div>
            <p className="font-medium">Narudžba se nije učitala</p>
            <p className="text-sm text-muted-foreground">
              {offline ? 'Server nije dostupan. Provjeri vezu.' : 'Došlo je do greške na serveru.'}
            </p>
          </div>
          <Button variant="outline" disabled={isFetching} onClick={() => void refetch()}>
            {isFetching ? <Loader2Icon className="animate-spin" /> : <RotateCwIcon />}
            Pokušaj ponovno
          </Button>
        </div>
      </DetailLayout>
    )
  }

  return (
    <DetailLayout
      title={order.order_reference}
      meta={
        <>
          <OrderStatusBadge status={order.status} />
          <PaymentStatusBadge status={order.payment_status} />
          <span className="tabular-nums">{formatDateTime(order.created_at)}</span>
        </>
      }
    >
      <div className="grid items-start gap-6 lg:grid-cols-3">
        <div className="grid gap-6 lg:col-span-2">
          <ItemsCard order={order} />
          <div className="grid gap-6 sm:grid-cols-2">
            <CustomerCard order={order} />
            <AddressCard order={order} />
          </div>
        </div>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Status narudžbe</CardTitle>
            </CardHeader>
            <CardContent>
              {/* key: forma drži svoje stanje i ne prati kasnije promjene propa. */}
              <UpdateOrderStatusForm key={order.id} order={order} />
            </CardContent>
          </Card>
          <PaymentCard order={order} />
        </div>
      </div>
    </DetailLayout>
  )
}

function ItemsCard({ order }: { order: OrderDetailData }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Stavke</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Proizvod</TableHead>
              <TableHead>Veličina</TableHead>
              <TableHead>Tisak</TableHead>
              <TableHead className="text-right">Kol.</TableHead>
              <TableHead className="text-right">Cijena</TableHead>
              <TableHead className="text-right">Iznos</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {order.items.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="whitespace-normal">
                  <Link
                    to="/proizvodi/$id/uredi"
                    params={{ id: String(item.product_id) }}
                    className="font-medium hover:underline"
                  >
                    {item.product_name}
                  </Link>
                </TableCell>
                <TableCell>{item.size ?? <Muted>—</Muted>}</TableCell>
                <TableCell>
                  {item.player_name || item.player_number ? (
                    <span>
                      {item.player_name}
                      {item.player_number && (
                        <span className="ml-1 font-mono tabular-nums">#{item.player_number}</span>
                      )}
                    </span>
                  ) : (
                    <Muted>Bez tiska</Muted>
                  )}
                </TableCell>
                <TableCell className="text-right tabular-nums">{item.quantity}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCurrency(item.price_at_purchase)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCurrency(item.price_at_purchase * item.quantity)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              {/* Ukupno je zbroj stavki — dostava se ne naplaćuje zasebno. */}
              <TableCell colSpan={5} className="text-right">
                Ukupno
              </TableCell>
              <TableCell className="text-right font-semibold tabular-nums">
                {formatCurrency(order.total_price)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  )
}

function CustomerCard({ order }: { order: OrderDetailData }) {
  const { name, email, phone } = order.customer
  return (
    <Card>
      <CardHeader>
        <CardTitle>Kupac</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-1 text-sm">
        <p className="font-medium">{name}</p>
        <a href={`mailto:${email}`} className="break-all hover:underline">
          {email}
        </a>
        {phone ? (
          <a href={`tel:${phone}`} className="tabular-nums hover:underline">
            {phone}
          </a>
        ) : (
          <Muted>Bez telefona</Muted>
        )}
      </CardContent>
    </Card>
  )
}

function AddressCard({ order }: { order: OrderDetailData }) {
  const { line1, line2, postal_code, city, country } = order.shipping_address
  return (
    <Card>
      <CardHeader>
        <CardTitle>Adresa dostave</CardTitle>
      </CardHeader>
      <CardContent>
        <address className="grid gap-1 text-sm not-italic">
          <span>{line1}</span>
          {line2 && <span>{line2}</span>}
          <span>
            {postal_code} {city}
          </span>
          <span>{formatCountry(country)}</span>
        </address>
      </CardContent>
    </Card>
  )
}

function PaymentCard({ order }: { order: OrderDetailData }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Plaćanje</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm">
        <PaymentStatusBadge status={order.payment_status} />
        <StripeId label="Checkout session" value={order.stripe.checkout_session_id} />
        <StripeId label="Payment intent" value={order.stripe.payment_intent_id} />
        <p className="text-muted-foreground">
          Zadnja izmjena: <span className="tabular-nums">{formatDateTime(order.updated_at)}</span>
        </p>
      </CardContent>
    </Card>
  )
}

function StripeId({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="grid gap-0.5">
      <span className="text-muted-foreground">{label}</span>
      {value ? <span className="font-mono text-xs break-all">{value}</span> : <Muted>—</Muted>}
    </div>
  )
}

function Muted({ children }: { children: ReactNode }) {
  return <span className="text-muted-foreground">{children}</span>
}

type DetailLayoutProps = {
  title: string
  meta?: ReactNode
  children: ReactNode
}

function DetailLayout({ title, meta, children }: DetailLayoutProps) {
  return (
    <div className="grid gap-6">
      <header className="grid gap-2">
        <Link
          to="/narudzbe"
          className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" />
          Narudžbe
        </Link>
        <h1 className="font-mono text-2xl font-semibold">{title}</h1>
        {meta && (
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">{meta}</div>
        )}
      </header>
      {children}
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-3" aria-busy="true" aria-label="Učitavanje narudžbe">
      <div className="grid gap-6 lg:col-span-2">
        <Skeleton className="h-64 rounded-xl" />
        <div className="grid gap-6 sm:grid-cols-2">
          <Skeleton className="h-36 rounded-xl" />
          <Skeleton className="h-36 rounded-xl" />
        </div>
      </div>
      <div className="grid gap-6">
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    </div>
  )
}

export function OrderNotFound() {
  return (
    <DetailLayout title="Narudžba nije pronađena">
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed px-6 py-12 text-center">
        <p className="text-sm text-muted-foreground">Narudžba ne postoji.</p>
        <Button asChild variant="outline">
          <Link to="/narudzbe">Natrag na narudžbe</Link>
        </Button>
      </div>
    </DetailLayout>
  )
}
