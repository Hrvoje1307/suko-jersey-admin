import { OrderDetail, OrderNotFound } from '@/widgets/order-detail'

type OrderDetailPageProps = {
  orderId: string
}

export function OrderDetailPage({ orderId }: OrderDetailPageProps) {
  const id = Number(orderId)
  if (!Number.isInteger(id) || id <= 0) {
    return <OrderNotFound />
  }
  return <OrderDetail orderId={id} />
}
