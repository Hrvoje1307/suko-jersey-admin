import { ShipmentNotFound, SupplierShipmentDetail } from '@/widgets/supplier-shipment-detail'

type SupplierShipmentDetailPageProps = {
  shipmentId: string
}

export function SupplierShipmentDetailPage({ shipmentId }: SupplierShipmentDetailPageProps) {
  const id = Number(shipmentId)
  if (!Number.isInteger(id) || id <= 0) {
    return <ShipmentNotFound />
  }
  return <SupplierShipmentDetail shipmentId={id} />
}
