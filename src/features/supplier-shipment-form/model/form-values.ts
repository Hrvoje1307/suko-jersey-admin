import type { SupplierShipment, SupplierShipmentFormValues } from '@/entities/supplier-shipment'

export const emptyShipmentFormValues: SupplierShipmentFormValues = {
  supplier_reference: '',
  tracking_number: '',
  note: '',
  order_ids: [],
}

export function shipmentToFormValues(shipment: SupplierShipment): SupplierShipmentFormValues {
  return {
    supplier_reference: shipment.supplier_reference ?? '',
    tracking_number: shipment.tracking_number ?? '',
    note: shipment.note ?? '',
    order_ids: shipment.orders.map((order) => order.id),
  }
}
