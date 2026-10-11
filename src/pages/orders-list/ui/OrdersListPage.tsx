import { OrdersTable, type OrdersSearch, type OrdersSearchChange } from '@/widgets/orders-table'

type OrdersListPageProps = {
  search: OrdersSearch
  onSearchChange: OrdersSearchChange
}

export function OrdersListPage({ search, onSearchChange }: OrdersListPageProps) {
  return (
    <div className="grid gap-6">
      <header>
        <h1 className="text-2xl font-semibold">Narudžbe</h1>
      </header>
      <OrdersTable search={search} onSearchChange={onSearchChange} />
    </div>
  )
}
