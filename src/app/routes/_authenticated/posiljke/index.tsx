import { createFileRoute } from '@tanstack/react-router'
import { SupplierShipmentsListPage } from '@/pages/supplier-shipments-list'

export const Route = createFileRoute('/_authenticated/posiljke/')({
  component: SupplierShipmentsListPage,
})
