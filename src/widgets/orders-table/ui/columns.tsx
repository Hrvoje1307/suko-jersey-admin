import { createColumnHelper } from '@tanstack/react-table'
import { Link } from '@tanstack/react-router'
import { OrderStatusBadge, PaymentStatusBadge, type Order } from '@/entities/order'
import { formatCurrency, formatDateTime } from '@/shared/lib'
import { countPieces } from '../model/search'
import { orderTableFeatures } from '../model/table-features'

const columnHelper = createColumnHelper<typeof orderTableFeatures, Order>()

// Država nije u listi — API je vraća samo u detalju (shipping_address).
export const orderColumns = columnHelper.columns([
  columnHelper.accessor('order_reference', {
    header: 'Referenca',
    // Pravi link uz klik na red: tipkovnica, cmd+klik i srednji klik.
    cell: ({ row, getValue }) => (
      <Link
        to="/narudzbe/$id"
        params={{ id: String(row.original.id) }}
        className="font-mono font-medium hover:underline"
      >
        {getValue()}
      </Link>
    ),
  }),
  columnHelper.accessor('created_at', {
    header: 'Datum',
    cell: ({ getValue }) => <span className="tabular-nums">{formatDateTime(getValue())}</span>,
  }),
  columnHelper.accessor('customer', {
    header: 'Kupac',
    cell: ({ getValue }) => (
      <div className="grid">
        <span className="font-medium">{getValue().name}</span>
        <span className="text-sm text-muted-foreground">{getValue().email}</span>
      </div>
    ),
  }),
  columnHelper.accessor(countPieces, {
    id: 'pieces',
    header: () => <span title="Ukupna količina svih stavki">Komada</span>,
    cell: ({ getValue }) => <span className="tabular-nums">{getValue()}</span>,
  }),
  columnHelper.accessor('total_price', {
    header: 'Ukupno',
    cell: ({ getValue }) => (
      <span className="font-medium tabular-nums">{formatCurrency(getValue())}</span>
    ),
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: ({ getValue }) => <OrderStatusBadge status={getValue()} />,
  }),
  columnHelper.accessor('payment_status', {
    header: 'Plaćanje',
    cell: ({ getValue }) => <PaymentStatusBadge status={getValue()} />,
  }),
])
