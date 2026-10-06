import {
  functionalUpdate,
  useTable,
  type PaginationState,
  type SortingState,
} from '@tanstack/react-table'
import { Link } from '@tanstack/react-router'
import {
  AlertCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Loader2Icon,
  PlusIcon,
  RotateCwIcon,
  ShirtIcon,
} from 'lucide-react'
import { useMemo } from 'react'
import { useAdminProducts, type Product } from '@/entities/product'
import { isApiError } from '@/shared/api'
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
  filterProducts,
  PAGE_SIZE,
  PRODUCT_SORT_FIELDS,
  type ProductsSearch,
  type ProductsSearchChange,
} from '../model/search'
import { productTableFeatures } from '../model/table-features'
import { productColumns } from './columns'
import { ProductsToolbar } from './ProductsToolbar'

type ProductsTableProps = {
  search: ProductsSearch
  onSearchChange: ProductsSearchChange
}

export function ProductsTable({ search, onSearchChange }: ProductsTableProps) {
  const productsQuery = useAdminProducts()

  // Greška u pozadinskom refetchu ne briše listu koja je već prikazana.
  if (productsQuery.isError && !productsQuery.data) {
    return (
      <ProductsError
        error={productsQuery.error}
        isRetrying={productsQuery.isFetching}
        onRetry={() => void productsQuery.refetch()}
      />
    )
  }

  if (productsQuery.data?.length === 0) {
    return <ProductsEmpty />
  }

  return (
    <div className="grid gap-4">
      <ProductsToolbar search={search} onSearchChange={onSearchChange} />
      {productsQuery.data ? (
        <ProductsDataTable
          products={productsQuery.data}
          search={search}
          onSearchChange={onSearchChange}
        />
      ) : (
        <ProductsTableSkeleton />
      )}
    </div>
  )
}

type ProductsDataTableProps = ProductsTableProps & {
  products: Product[]
}

function ProductsDataTable({ products, search, onSearchChange }: ProductsDataTableProps) {
  const { q, category, status, type } = search
  const filtered = useMemo(
    () => filterProducts(products, { q, category, status, type }),
    [products, q, category, status, type],
  )

  // Bez parametara u URL-u: najnoviji prvi. Cijena po defaultu raste.
  const sortField = search.sort ?? 'created_at'
  const sortDesc = search.dir ? search.dir === 'desc' : sortField === 'created_at'
  const sorting = useMemo<SortingState>(
    () => [{ id: sortField, desc: sortDesc }],
    [sortField, sortDesc],
  )

  // Clamp jer ?page= može biti iza kraja — ručno upisan URL ili obrisan
  // zadnji proizvod na zadnjoj stranici.
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageIndex = Math.min((search.page ?? 1) - 1, pageCount - 1)
  const pagination = useMemo<PaginationState>(
    () => ({ pageIndex, pageSize: PAGE_SIZE }),
    [pageIndex],
  )

  // Stanje tablice živi u URL-u: tablica samo javlja promjenu, a nova
  // vrijednost stiže natrag kroz search.
  const table = useTable({
    features: productTableFeatures,
    columns: productColumns,
    data: filtered,
    getRowId: (product) => String(product.id),
    state: { sorting, pagination },
    enableSortingRemoval: false,
    autoResetPageIndex: false,
    onSortingChange: (updater) => {
      const [next] = functionalUpdate(updater, sorting)
      const field = PRODUCT_SORT_FIELDS.find((id) => id === next?.id)
      if (!next || !field) return
      const isDefault = field === 'created_at' && next.desc
      onSearchChange({
        sort: isDefault ? undefined : field,
        dir: isDefault ? undefined : next.desc ? 'desc' : 'asc',
        page: undefined,
      })
    },
    onPaginationChange: (updater) => {
      const next = functionalUpdate(updater, pagination)
      onSearchChange({ page: next.pageIndex === 0 ? undefined : next.pageIndex + 1 })
    },
  })

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
                <TableRow key={row.id}>
                  {row.getAllCells().map((cell) => (
                    <TableCell key={cell.id}>
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={productColumns.length} className="h-40 text-center">
                  <p className="text-muted-foreground">
                    Nijedan proizvod ne odgovara pretrazi i filterima.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-3"
                    onClick={() => onSearchChange(CLEARED_FILTERS)}
                  >
                    Očisti filtere
                  </Button>
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
            {filtered.length < products.length && ` (ukupno ${products.length})`}
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

function ProductsTableSkeleton() {
  return (
    <div className="rounded-md border" aria-busy="true" aria-label="Učitavanje proizvoda">
      <Table>
        <TableBody>
          {Array.from({ length: SKELETON_ROWS }, (_, index) => (
            <TableRow key={index} className="hover:bg-transparent">
              <TableCell className="w-16">
                <Skeleton className="size-12" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-48" />
              </TableCell>
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
                <Skeleton className="h-5 w-20 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="ml-auto h-8 w-36" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function ProductsEmpty() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-dashed px-6 py-16 text-center">
      <ShirtIcon className="size-10 text-muted-foreground" />
      <div>
        <p className="font-medium">Još nema proizvoda</p>
        <p className="text-sm text-muted-foreground">Dodaj prvi dres i pojavit će se ovdje.</p>
      </div>
      <Button asChild>
        <Link to="/proizvodi/novi">
          <PlusIcon />
          Novi proizvod
        </Link>
      </Button>
    </div>
  )
}

type ProductsErrorProps = {
  error: Error
  isRetrying: boolean
  onRetry: () => void
}

function ProductsError({ error, isRetrying, onRetry }: ProductsErrorProps) {
  const offline = isApiError(error) && !error.response

  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-3 rounded-md border border-destructive/30 bg-destructive/5 px-6 py-16 text-center"
    >
      <AlertCircleIcon className="size-10 text-destructive" />
      <div>
        <p className="font-medium">Proizvodi se nisu učitali</p>
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
