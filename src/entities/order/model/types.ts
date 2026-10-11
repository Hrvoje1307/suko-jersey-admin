import { z } from 'zod'

// Fulfillment — zasebna os od naplate (payment_status).
export const ORDER_STATUSES = ['ordered', 'sent_to_supplier', 'arrived_hr', 'shipped', 'delivered'] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]

export const PAYMENT_STATUSES = ['paid', 'unpaid', 'failed', 'refunded'] as const
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number]

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  ordered: 'Zaprimljena',
  sent_to_supplier: 'Naručeno kod dobavljača',
  arrived_hr: 'Stiglo u HR',
  shipped: 'Poslano',
  delivered: 'Dostavljeno',
}

// Što kupac vidi u emailu i praćenju (OrderStatus::label() na backendu).
// arrived_hr je namjerno neutralan — kupac ne smije znati da roba ide preko HR.
export const ORDER_STATUS_CUSTOMER_LABELS: Record<OrderStatus, string> = {
  ordered: 'Narudžba zaprimljena',
  sent_to_supplier: 'Naručeno kod dobavljača',
  arrived_hr: 'Priprema za slanje',
  shipped: 'Poslano',
  delivered: 'Dostavljeno',
}

// Tracking broj ide u email i praćenje samo u ovim statusima
// (OrderStatus::exposesTracking()).
export const TRACKING_VISIBLE_STATUSES: readonly OrderStatus[] = ['shipped', 'delivered']

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  paid: 'Plaćeno',
  unpaid: 'Neplaćeno',
  failed: 'Neuspjelo',
  refunded: 'Refundirano',
}

const orderItemSchema = z.object({
  product_id: z.number(),
  product_name: z.string(),
  // NOT NULL u Supabaseu, ali nullable u migraciji — jedna stavka bez
  // veličine ne smije srušiti cijelu listu.
  size: z.string().nullable(),
  quantity: z.number(),
  // Tisak, onako kako ga je kupac upisao; broj može postojati i bez imena.
  player_name: z.string().nullable(),
  player_number: z.string().nullable(),
})
export type OrderItem = z.infer<typeof orderItemSchema>

// GET /admin/orders vraća goli niz, najnovije prvo; PUT /status isti oblik.
export const orderSchema = z.object({
  id: z.number(),
  order_reference: z.string(),
  customer: z.object({
    name: z.string(),
    email: z.string(),
  }),
  status: z.enum(ORDER_STATUSES),
  payment_status: z.enum(PAYMENT_STATUSES),
  total_price: z.number(),
  items: z.array(orderItemSchema),
  created_at: z.string(),
})
export type Order = z.infer<typeof orderSchema>

export const orderDetailSchema = orderSchema.extend({
  customer: orderSchema.shape.customer.extend({
    phone: z.string().nullable(),
  }),
  items: z.array(
    orderItemSchema.extend({
      // Jedinična cijena u trenutku kupnje.
      price_at_purchase: z.number(),
    }),
  ),
  shipping_address: z.object({
    line1: z.string(),
    line2: z.string().nullable(),
    city: z.string(),
    postal_code: z.string(),
    // ISO 3166-1 alpha-2
    country: z.string(),
  }),
  tracking_number_internal: z.string().nullable(),
  stripe: z.object({
    checkout_session_id: z.string().nullable(),
    payment_intent_id: z.string().nullable(),
  }),
  updated_at: z.string(),
})
export type OrderDetail = z.infer<typeof orderDetailSchema>
export type OrderDetailItem = OrderDetail['items'][number]

// API prima do 255 znakova, ali stupac u Supabaseu je VARCHAR(100).
// Prazno postaje null — API ga tada briše (šalje se uvijek, namjerno).
export const orderStatusFormSchema = z.object({
  status: z.enum(ORDER_STATUSES),
  tracking_number_internal: z
    .string()
    .trim()
    .max(100, 'Tracking broj može imati najviše 100 znakova.')
    .transform((value) => value || null),
})
export type OrderStatusFormValues = z.input<typeof orderStatusFormSchema>
export type OrderStatusPayload = z.output<typeof orderStatusFormSchema>
