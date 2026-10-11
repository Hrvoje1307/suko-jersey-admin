import { z } from 'zod'
import { orderSchema, type OrderStatus } from '@/entities/order'

// Lista i detalj su isti oblik; narudžbe su kratki OrderAdmin, najstarija prva.
// Pošiljka nema vlastiti status — vidi getShipmentProgress().
export const supplierShipmentSchema = z.object({
  id: z.number(),
  supplier_reference: z.string().nullable(),
  // Dobavljač → HR, samo za admina; kupac ga nikad ne vidi.
  tracking_number: z.string().nullable(),
  note: z.string().nullable(),
  orders: z.array(orderSchema),
  created_at: z.string(),
  updated_at: z.string(),
})
export type SupplierShipment = z.infer<typeof supplierShipmentSchema>

// Koraci koje pošiljka radi skupa. Dalje (Poslano, Dostavljeno) svaka
// narudžba ide sama, s vlastitim trackingom.
export const SHIPMENT_STEPS = ['sent_to_supplier', 'arrived_hr'] as const satisfies readonly OrderStatus[]
export type ShipmentStep = (typeof SHIPMENT_STEPS)[number]

// API: najviše 100 narudžbi, tekstovi do 100 (bilješka do 1000) znakova.
export const SHIPMENT_ORDERS_MAX = 100

const optionalText = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, `${label} može imati najviše ${max} znakova.`)
    .transform((value) => value || null)

// Šalje se uvijek sve — PUT je full replace, prazno polje briše vrijednost.
export const supplierShipmentFormSchema = z.object({
  supplier_reference: optionalText(100, 'Broj narudžbe'),
  tracking_number: optionalText(100, 'Tracking broj'),
  note: optionalText(1000, 'Bilješka'),
  order_ids: z
    .array(z.number())
    .max(SHIPMENT_ORDERS_MAX, `Pošiljka može imati najviše ${SHIPMENT_ORDERS_MAX} narudžbi.`),
})
export type SupplierShipmentFormValues = z.input<typeof supplierShipmentFormSchema>
export type SupplierShipmentPayload = z.output<typeof supplierShipmentFormSchema>
