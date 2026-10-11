import { Link, useNavigate } from '@tanstack/react-router'
import { AlertCircleIcon, Loader2Icon, PackageIcon, PlusIcon, RotateCwIcon } from 'lucide-react'
import type { MouseEvent } from 'react'
import { countPieces } from '@/entities/order'
import {
  formatShipmentName,
  getShipmentProgress,
  ShipmentPhaseBadge,
  useSupplierShipments,
  type SupplierShipment,
} from '@/entities/supplier-shipment'
import { isApiError } from '@/shared/api'
import { formatDate } from '@/shared/lib'
import {
  Button,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui'

export function SupplierShipmentsTable() {
  const shipmentsQuery = useSupplierShipments()
  const navigate = useNavigate()

  if (shipmentsQuery.isError && !shipmentsQuery.data) {
    return (
      <ShipmentsError
        error={shipmentsQuery.error}
        isRetrying={shipmentsQuery.isFetching}
        onRetry={() => void shipmentsQuery.refetch()}
      />
    )
  }

  if (!shipmentsQuery.data) {
    return <ShipmentsTableSkeleton />
  }

  if (shipmentsQuery.data.length === 0) {
    return <ShipmentsEmpty />
  }

  // Kao u listi narudžbi: red vodi na detalj, ali ne preuzima klik s linka,
  // cmd/ctrl+klik ni označavanje teksta.
  const openShipment = (event: MouseEvent, shipment: SupplierShipment) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    if ((event.target as HTMLElement).closest('a, button')) return
    if (window.getSelection()?.toString()) return
    void navigate({ to: '/posiljke/$id', params: { id: String(shipment.id) } })
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pošiljka</TableHead>
            <TableHead>Kreirana</TableHead>
            <TableHead>Narudžbe</TableHead>
            <TableHead>Stanje</TableHead>
            <TableHead>Tracking</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shipmentsQuery.data.map((shipment) => (
            <ShipmentRow key={shipment.id} shipment={shipment} onClick={openShipment} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

type ShipmentRowProps = {
  shipment: SupplierShipment
  onClick: (event: MouseEvent, shipment: SupplierShipment) => void
}

function ShipmentRow({ shipment, onClick }: ShipmentRowProps) {
  const { phase, counts } = getShipmentProgress(shipment)
  const pieces = shipment.orders.reduce((sum, order) => sum + countPieces(order), 0)
  const paid = Object.values(counts).reduce((sum, count) => sum + count, 0)
  const sent = counts.shipped + counts.delivered

  return (
    <TableRow className="cursor-pointer" onClick={(event) => onClick(event, shipment)}>
      <TableCell>
        <div className="grid">
          <Link
            to="/posiljke/$id"
            params={{ id: String(shipment.id) }}
            className="font-medium hover:underline"
          >
            {formatShipmentName(shipment)}
          </Link>
          {shipment.supplier_reference && (
            <span className="font-mono text-sm text-muted-foreground">
              {shipment.supplier_reference}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell className="tabular-nums">{formatDate(shipment.created_at)}</TableCell>
      <TableCell className="tabular-nums">
        {shipment.orders.length}
        <span className="text-muted-foreground"> · {pieces} kom.</span>
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap items-center gap-2">
          <ShipmentPhaseBadge phase={phase} />
          {phase === 'in_croatia' && (
            <span className="text-sm text-muted-foreground tabular-nums">
              poslano {sent}/{paid}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell>
        {shipment.tracking_number ? (
          <span className="font-mono text-sm">{shipment.tracking_number}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
    </TableRow>
  )
}

function ShipmentsTableSkeleton() {
  return (
    <div className="rounded-md border" aria-busy="true" aria-label="Učitavanje pošiljki">
      <Table>
        <TableBody>
          {Array.from({ length: 5 }, (_, index) => (
            <TableRow key={index} className="hover:bg-transparent">
              <TableCell>
                <Skeleton className="h-4 w-28" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-32 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function ShipmentsEmpty() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-dashed px-6 py-16 text-center">
      <PackageIcon className="size-10 text-muted-foreground" />
      <div>
        <p className="font-medium">Još nema pošiljki</p>
        <p className="max-w-md text-sm text-muted-foreground">
          Skupi narudžbe koje zajedno naručuješ kod dobavljača — putuju skupa do Hrvatske, a odande
          svaka ide kupcu zasebno.
        </p>
      </div>
      <Button asChild>
        <Link to="/posiljke/nova">
          <PlusIcon />
          Nova pošiljka
        </Link>
      </Button>
    </div>
  )
}

type ShipmentsErrorProps = {
  error: Error
  isRetrying: boolean
  onRetry: () => void
}

function ShipmentsError({ error, isRetrying, onRetry }: ShipmentsErrorProps) {
  const offline = isApiError(error) && !error.response

  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-3 rounded-md border border-destructive/30 bg-destructive/5 px-6 py-16 text-center"
    >
      <AlertCircleIcon className="size-10 text-destructive" />
      <div>
        <p className="font-medium">Pošiljke se nisu učitale</p>
        <p className="text-sm text-muted-foreground">
          {offline ? 'Server nije dostupan. Provjeri vezu.' : 'Došlo je do greške na serveru.'}
        </p>
      </div>
      <Button variant="outline" disabled={isRetrying} onClick={onRetry}>
        {isRetrying ? <Loader2Icon className="animate-spin" /> : <RotateCwIcon />}
        Pokušaj ponovno
      </Button>
    </div>
  )
}
