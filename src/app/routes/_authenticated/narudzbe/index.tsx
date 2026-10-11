import { createFileRoute } from '@tanstack/react-router'
import { OrdersListPage } from '@/pages/orders-list'
import { ordersSearchSchema, type OrdersSearchChange } from '@/widgets/orders-table'

// Pretraga, filteri i stranica žive u URL-u — refresh i back gumb čuvaju
// stanje liste.
export const Route = createFileRoute('/_authenticated/narudzbe/')({
  validateSearch: ordersSearchSchema,
  component: RouteComponent,
})

function RouteComponent() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  const onSearchChange: OrdersSearchChange = (patch) => {
    void navigate({ search: (prev) => ({ ...prev, ...patch }) })
  }

  return <OrdersListPage search={search} onSearchChange={onSearchChange} />
}
