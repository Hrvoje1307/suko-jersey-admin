import { Link } from '@tanstack/react-router'
import { ArrowLeftIcon, Loader2Icon, RotateCwIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { ORDER_STATUSES, OrderStatusBadge } from '@/entities/order'
import {
  formatShipmentName,
  getShipmentProgress,
  ShipmentPhaseBadge,
  useSupplierShipment,
  type ShipmentPhase,
  type SupplierShipment,
} from '@/entities/supplier-shipment'
import { AdvanceShipmentButton } from '@/features/advance-supplier-shipment'
import { DeleteShipmentButton } from '@/features/delete-supplier-shipment'
import { SupplierShipmentForm } from '@/features/supplier-shipment-form'
import { isApiError } from '@/shared/api'
import { formatDate } from '@/shared/lib'
import { Button, Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/shared/ui'

type SupplierShipmentDetailProps = {
  shipmentId: number
}

export function SupplierShipmentDetail({ shipmentId }: SupplierShipmentDetailProps) {
  const { data: shipment, error, isPending, isError, isFetching, refetch } =
    useSupplierShipment(shipmentId)

  if (isPending) {
    return (
      <DetailLayout title="Pošiljka">
        <DetailSkeleton />
      </DetailLayout>
    )
  }

  if (isError) {
    if (isApiError(error) && error.response?.status === 404) {
      return <ShipmentNotFound />
    }
    const offline = isApiError(error) && !error.response
    return (
      <DetailLayout title="Pošiljka">
        <div
          role="alert"
          className="flex flex-col items-center gap-3 rounded-md border border-destructive/30 bg-destructive/5 px-6 py-12 text-center"
        >
          <div>
            <p className="font-medium">Pošiljka se nije učitala</p>
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

  const progress = getShipmentProgress(shipment)

  return (
    <DetailLayout
      title={formatShipmentName(shipment)}
      meta={
        <>
          <ShipmentPhaseBadge phase={progress.phase} />
          <span className="tabular-nums">kreirana {formatDate(shipment.created_at)}</span>
        </>
      }
      actions={<DeleteShipmentButton shipment={shipment} />}
    >
      <div className="grid items-start gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {/* key: forma drži svoje stanje i ne prati kasnije promjene propa. */}
          <SupplierShipmentForm key={shipment.id} shipment={shipment} />
        </div>
        <ProgressCard shipment={shipment} />
      </div>
    </DetailLayout>
  )
}

// Što admin radi u kojoj fazi — pošiljka putuje skupa samo do Hrvatske.
const PHASE_HINTS: Record<ShipmentPhase, string> = {
  empty: 'Dodaj plaćene narudžbe koje zajedno naručuješ kod dobavljača.',
  collecting: 'Kad naručiš kod dobavljača, označi pošiljku — kupci dobivaju email „Naručeno kod dobavljača“.',
  at_supplier: 'Kad paket stigne u Hrvatsku, označi pošiljku — kupci dobivaju email „Priprema za slanje“.',
  in_croatia:
    'Dalje svaku narudžbu šalješ zasebno: na detalju narudžbe upiši tracking i stavi status Poslano.',
  dispatched: 'Sve narudžbe iz pošiljke su poslane kupcima.',
}

function ProgressCard({ shipment }: { shipment: SupplierShipment }) {
  const { phase, counts, skipped } = getShipmentProgress(shipment)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stanje pošiljke</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 text-sm">
        {phase !== 'empty' && (
          <ul className="grid gap-2">
            {ORDER_STATUSES.filter((status) => counts[status] > 0).map((status) => (
              <li key={status} className="flex items-center justify-between gap-2">
                <OrderStatusBadge status={status} />
                <span className="tabular-nums">{counts[status]}</span>
              </li>
            ))}
          </ul>
        )}
        {skipped.length > 0 && (
          <p className="text-muted-foreground">
            Neplaćene i refundirane narudžbe ({skipped.length}) pošiljka ne pomiče.
          </p>
        )}
        <p className="text-muted-foreground">{PHASE_HINTS[phase]}</p>
        <AdvanceShipmentButton shipment={shipment} />
      </CardContent>
    </Card>
  )
}

type DetailLayoutProps = {
  title: string
  meta?: ReactNode
  actions?: ReactNode
  children: ReactNode
}

function DetailLayout({ title, meta, actions, children }: DetailLayoutProps) {
  return (
    <div className="grid gap-6">
      <header className="grid gap-2">
        <Link
          to="/posiljke"
          className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" />
          Pošiljke
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-semibold">{title}</h1>
          {actions}
        </div>
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
    <div className="grid gap-6 lg:grid-cols-3" aria-busy="true" aria-label="Učitavanje pošiljke">
      <div className="grid gap-6 lg:col-span-2">
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
      <Skeleton className="h-56 rounded-xl" />
    </div>
  )
}

export function ShipmentNotFound() {
  return (
    <DetailLayout title="Pošiljka nije pronađena">
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed px-6 py-12 text-center">
        <p className="text-sm text-muted-foreground">Pošiljka ne postoji ili je obrisana.</p>
        <Button asChild variant="outline">
          <Link to="/posiljke">Natrag na pošiljke</Link>
        </Button>
      </div>
    </DetailLayout>
  )
}
