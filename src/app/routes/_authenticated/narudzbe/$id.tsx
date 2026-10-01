import { createFileRoute } from '@tanstack/react-router'
import { OrderDetailPage } from '@/pages/order-detail'

export const Route = createFileRoute('/_authenticated/narudzbe/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  return <OrderDetailPage orderId={id} />
}
