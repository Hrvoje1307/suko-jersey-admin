import { createFileRoute } from '@tanstack/react-router'
import { ProductsListPage } from '@/pages/products-list'
import { productsSearchSchema, type ProductsSearchChange } from '@/widgets/products-table'

// Pretraga, filteri, sortiranje i stranica žive u URL-u — refresh i back
// gumb čuvaju stanje liste.
export const Route = createFileRoute('/_authenticated/proizvodi/')({
  validateSearch: productsSearchSchema,
  component: RouteComponent,
})

function RouteComponent() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  const onSearchChange: ProductsSearchChange = (patch) => {
    void navigate({ search: (prev) => ({ ...prev, ...patch }) })
  }

  return <ProductsListPage search={search} onSearchChange={onSearchChange} />
}
