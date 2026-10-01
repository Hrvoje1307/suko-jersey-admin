type OrderDetailPageProps = {
  orderId: string
}

export function OrderDetailPage({ orderId }: OrderDetailPageProps) {
  return <h1 className="text-2xl font-semibold">Narudžba #{orderId}</h1>
}
