import { createFileRoute } from '@tanstack/react-router'
import { SupplierShipmentDetailPage } from '@/pages/supplier-shipment-detail'

export const Route = createFileRoute('/_authenticated/posiljke/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  return <SupplierShipmentDetailPage shipmentId={id} />
}
