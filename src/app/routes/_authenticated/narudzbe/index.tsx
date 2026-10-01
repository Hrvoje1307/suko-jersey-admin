import { createFileRoute } from '@tanstack/react-router'
import { OrdersListPage } from '@/pages/orders-list'

export const Route = createFileRoute('/_authenticated/narudzbe/')({
  component: OrdersListPage,
})
