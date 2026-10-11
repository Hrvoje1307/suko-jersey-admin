import { DashboardStats } from '@/widgets/dashboard-stats'
import { OrdersToProcess } from '@/widgets/orders-to-process'
import { TopProducts } from '@/widgets/top-products'

export function DashboardPage() {
  return (
    <div className="grid gap-6">
      <header>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
      </header>
      <DashboardStats />
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <OrdersToProcess />
        <TopProducts />
      </div>
    </div>
  )
}
