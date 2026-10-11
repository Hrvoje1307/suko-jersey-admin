import { z } from 'zod'

// GET /admin/dashboard. "Ovaj mjesec" je od 1. u mjesecu po UTC-u (backend).
export const dashboardSchema = z.object({
  // Sve narudžbe mjeseca — i neplaćene (napušteni checkouti), neuspjele i refundirane.
  total_orders_this_month: z.number(),
  // Samo plaćene narudžbe mjeseca.
  revenue_this_month: z.number(),
  // Top 5 po prodanim komadima, ukupno (ne samo ovaj mjesec).
  top_products: z.array(
    z.object({
      product_name: z.string(),
      units_sold: z.number(),
    }),
  ),
})
export type Dashboard = z.infer<typeof dashboardSchema>
export type TopProduct = Dashboard['top_products'][number]
