import { createColumnHelper } from '@tanstack/react-table'
import { Link } from '@tanstack/react-router'
import { PencilIcon } from 'lucide-react'
import { DeleteProductButton } from '@/features/delete-product'
import {
  CATEGORY_LABELS,
  PRODUCT_TYPE_LABELS,
  ProductStatusBadge,
  ProductThumb,
  type Product,
} from '@/entities/product'
import { formatCurrency, formatDate } from '@/shared/lib'
import { Button } from '@/shared/ui'
import { productTableFeatures } from '../model/table-features'
import { SortableHeader } from './SortableHeader'

const columnHelper = createColumnHelper<typeof productTableFeatures, Product>()

export const productColumns = columnHelper.columns([
  columnHelper.display({
    id: 'image',
    header: () => <span className="sr-only">Slika</span>,
    cell: ({ row }) => (
      <ProductThumb src={row.original.primary_image_url} alt={row.original.name} />
    ),
  }),
  columnHelper.accessor('name', {
    header: 'Naziv',
    enableSorting: false,
    cell: ({ getValue }) => <span className="font-medium">{getValue()}</span>,
  }),
  columnHelper.accessor('club_or_team', {
    header: 'Klub',
    enableSorting: false,
  }),
  columnHelper.accessor('category', {
    header: 'Kategorija',
    enableSorting: false,
    cell: ({ getValue }) => CATEGORY_LABELS[getValue()],
  }),
  columnHelper.accessor('type', {
    header: 'Uzrast',
    enableSorting: false,
    cell: ({ getValue }) => PRODUCT_TYPE_LABELS[getValue()],
  }),
  columnHelper.accessor('season', {
    header: 'Sezona',
    enableSorting: false,
  }),
  columnHelper.accessor('price', {
    header: ({ column }) => <SortableHeader column={column} label="Cijena" />,
    sortFn: 'basic',
    // Za brojeve TanStack inače počinje silazno; najjeftinije prvo je intuitivnije.
    sortDescFirst: false,
    cell: ({ getValue }) => <span className="tabular-nums">{formatCurrency(getValue())}</span>,
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    enableSorting: false,
    cell: ({ getValue }) => <ProductStatusBadge status={getValue()} />,
  }),
  // Timestamp umjesto ISO stringa; undefined (ne null) jer sortUndefined
  // hvata samo undefined — proizvodi bez datuma idu na kraj.
  columnHelper.accessor((product) => (product.created_at ? Date.parse(product.created_at) : undefined), {
    id: 'created_at',
    header: ({ column }) => <SortableHeader column={column} label="Dodano" />,
    sortFn: 'basic',
    sortDescFirst: true,
    sortUndefined: 'last',
    cell: ({ row }) =>
      row.original.created_at ? (
        <span className="tabular-nums">{formatDate(row.original.created_at)}</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  }),
  columnHelper.display({
    id: 'actions',
    header: () => <span className="sr-only">Akcije</span>,
    cell: ({ row }) => (
      <div className="flex justify-end gap-1">
        <Button asChild variant="ghost" size="sm">
          <Link to="/proizvodi/$id/uredi" params={{ id: String(row.original.id) }}>
            <PencilIcon />
            Uredi
          </Link>
        </Button>
        <DeleteProductButton product={row.original} />
      </div>
    ),
  }),
])
