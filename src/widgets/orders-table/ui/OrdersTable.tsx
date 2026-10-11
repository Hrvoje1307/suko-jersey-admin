import { functionalUpdate, useTable, type PaginationState } from '@tanstack/react-table'
import { useNavigate } from '@tanstack/react-router'
import {
  AlertCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Loader2Icon,
  ReceiptTextIcon,
  RotateCwIcon,
} from 'lucide-react'
import { useMemo, type MouseEvent } from 'react'
import { useAdminOrders, type Order } from '@/entities/order'
import { isApiError } from '@/shared/api'
import { cn } from '@/shared/lib'
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
import {
  CLEARED_FILTERS,
  countHiddenUnpaid,
  filterOrders,
  PAGE_SIZE,
  type OrdersSearch,
  type OrdersSearchChange,
} from '../model/search'
import { orderTableFeatures } from '../model/table-features'
import { orderColumns } from './columns'
import { OrdersToolbar } from './OrdersToolbar'

type OrdersTableProps = {
  search: OrdersSearch
  onSearchChange: OrdersSearchChange
}

export function OrdersTable({ search, onSearchChange }: OrdersTableProps) {
  const ordersQuery = useAdminOrders()

  // Greška u pozadinskom refetchu ne briše listu koja je već prikazana.
  if (ordersQuery.isError && !ordersQuery.data) {
    return (
      <OrdersError
        error={ordersQuery.error}
        isRetrying={ordersQuery.isFetching}
        onRetry={() => void ordersQuery.refetch()}
      />
    )
  }

  // Po sirovoj listi — i neplaćene se broje, iako su po defaultu skrivene.
  if (ordersQuery.data?.length === 0) {
    return <OrdersEmpty />
  }

  return (
    <div className="grid gap-4">
      <OrdersToolbar search={search} onSearchChange={onSearchChange} />
      {ordersQuery.data ? (
        <OrdersDataTable orders={ordersQuery.data} search={search} onSearchChange={onSearchChange} />
      ) : (
        <OrdersTableSkeleton />
      )}
    </div>
  )
}

type OrdersDataTableProps = OrdersTableProps & {
  orders: Order[]
}

function OrdersDataTable({ orders, search, onSearchChange }: OrdersDataTableProps) {
  const navigate = useNavigate()
  const { q, status, payment } = search
  const filtered = useMemo(
    () => filterOrders(orders, { q, status, payment }),
    [orders, q, status, payment],
  )
  const hiddenUnpaid = useMemo(
    () => countHiddenUnpaid(orders, { q, status, payment }),
    [orders, q, status, payment],
  )

  // Clamp jer ?page= može biti iza kraja (ručno upisan URL).
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageIndex = Math.min((search.page ?? 1) - 1, pageCount - 1)
  const pagination = useMemo<PaginationState>(
    () => ({ pageIndex, pageSize: PAGE_SIZE }),
    [pageIndex],
  )

  // Stanje tablice živi u URL-u: tablica samo javlja promjenu, a nova
  // vrijednost stiže natrag kroz search.
  const table = useTable({
    features: orderTableFeatures,
    columns: orderColumns,
    data: filtered,
    getRowId: (order) => String(order.id),
    state: { pagination },
    autoResetPageIndex: false,
    onPaginationChange: (updater) => {
      const next = functionalUpdate(updater, pagination)
      onSearchChange({ page: next.pageIndex === 0 ? undefined : next.pageIndex + 1 })
    },
  })

  // Cijeli red vodi na detalj, ali ne preuzima klik s linka, cmd/ctrl+klik
  // (to radi link u referenci) ni klik kojim se označava tekst.
  const openOrder = (event: MouseEvent, order: Order) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    if ((event.target as HTMLElement).closest('a, button')) return
    if (window.getSelection()?.toString()) return
    void navigate({ to: '/narudzbe/$id', params: { id: String(order.id) } })
  }

  const showUnpaid = () => onSearchChange({ payment: 'all', page: undefined })
  const rows = table.getRowModel().rows
  const from = pageIndex * PAGE_SIZE + 1
  const to = Math.min(from + PAGE_SIZE - 1, filtered.length)

  return (
    <div className="grid gap-3">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={cn(
                    'cursor-pointer',
                    // Prigušeno kad su neplaćene prikazane uz ostale.
                    row.original.payment_status === 'unpaid' && 'text-muted-foreground opacity-70',
                  )}
                  onClick={(event) => openOrder(event, row.original)}
                >
                  {row.getAllCells().map((cell) => (
                    <TableCell key={cell.id}>
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={orderColumns.length} className="h-40 text-center">
                  <p className="text-muted-foreground">
                    {hiddenUnpaid > 0
                      ? `Nijedna narudžba ne odgovara filterima. Skriveno neplaćenih: ${hiddenUnpaid}.`
                      : 'Nijedna narudžba ne odgovara pretrazi i filterima.'}
                  </p>
                  <div className="mt-3 flex justify-center gap-2">
                    {hiddenUnpaid > 0 && (
                      <Button variant="outline" onClick={showUnpaid}>
                        Prikaži neplaćene
                      </Button>
                    )}
                    {(q || status) && (
                      <Button variant="outline" onClick={() => onSearchChange(CLEARED_FILTERS)}>
                        Očisti filtere
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {filtered.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
          <span className="tabular-nums">
            {from}–{to} od {filtered.length}
            {hiddenUnpaid > 0 && (
              <>
                {' · '}skriveno neplaćenih: {hiddenUnpaid}{' '}
                <Button variant="link" size="sm" className="h-auto p-0" onClick={showUnpaid}>
                  Prikaži
                </Button>
              </>
            )}
          </span>
          {pageCount > 1 && (
            <div className="flex items-center gap-2">
              <span className="tabular-nums">
                Stranica {pageIndex + 1} od {pageCount}
              </span>
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="Prethodna stranica"
                disabled={!table.getCanPreviousPage()}
                onClick={() => table.previousPage()}
              >
                <ChevronLeftIcon />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="Sljedeća stranica"
                disabled={!table.getCanNextPage()}
                onClick={() => table.nextPage()}
              >
                <ChevronRightIcon />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const SKELETON_ROWS = 8

function OrdersTableSkeleton() {
  return (
    <div className="rounded-md border" aria-busy="true" aria-label="Učitavanje narudžbi">
      <Table>
        <TableBody>
          {Array.from({ length: SKELETON_ROWS }, (_, index) => (
            <TableRow key={index} className="hover:bg-transparent">
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-32" />
              </TableCell>
              <TableCell>
                <Skeleton className="mb-1 h-4 w-36" />
                <Skeleton className="h-3 w-44" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-6" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-24 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-20 rounded-full" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function OrdersEmpty() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-dashed px-6 py-16 text-center">
      <ReceiptTextIcon className="size-10 text-muted-foreground" />
      <div>
        <p className="font-medium">Još nema narudžbi</p>
        <p className="text-sm text-muted-foreground">
          Narudžbe iz webshopa pojavit će se ovdje čim kupac krene na plaćanje.
        </p>
      </div>
    </div>
  )
}

type OrdersErrorProps = {
  error: Error
  isRetrying: boolean
  onRetry: () => void
}

function OrdersError({ error, isRetrying, onRetry }: OrdersErrorProps) {
  const offline = isApiError(error) && !error.response

  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-3 rounded-md border border-destructive/30 bg-destructive/5 px-6 py-16 text-center"
    >
      <AlertCircleIcon className="size-10 text-destructive" />
      <div>
        <p className="font-medium">Narudžbe se nisu učitale</p>
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
