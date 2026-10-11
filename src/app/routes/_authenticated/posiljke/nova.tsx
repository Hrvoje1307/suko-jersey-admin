import { createFileRoute } from '@tanstack/react-router'
import { SupplierShipmentCreatePage } from '@/pages/supplier-shipment-create'

export const Route = createFileRoute('/_authenticated/posiljke/nova')({
  component: SupplierShipmentCreatePage,
})
