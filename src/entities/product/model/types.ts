import { z } from 'zod'

export const PRODUCT_CATEGORIES = ['football', 'formula', 'basketball'] as const
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]

// Backend `type` je ciljana skupina (odrasli/djeca), ne vrsta dresa —
// domaći/gostujući API ne razlikuje.
export const PRODUCT_TYPES = ['adult', 'kids'] as const
export type ProductType = (typeof PRODUCT_TYPES)[number]

export const PRODUCT_STATUSES = ['active', 'draft', 'sold_out'] as const
export type ProductStatus = (typeof PRODUCT_STATUSES)[number]

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  football: 'Nogomet',
  formula: 'F1',
  basketball: 'Košarka',
}

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  adult: 'Odrasli',
  kids: 'Djeca',
}

export const STATUS_LABELS: Record<ProductStatus, string> = {
  active: 'Aktivan',
  draft: 'Skica',
  sold_out: 'Rasprodano',
}

// GET /admin/products vraća goli niz ProductDetail objekata. Lista treba samo
// polja iz ProductSummary — zod ostatak (opis, slike, igrači) odbacuje.
export const productSchema = z.object({
  id: z.number(),
  name: z.string(),
  club_or_team: z.string(),
  category: z.enum(PRODUCT_CATEGORIES),
  type: z.enum(PRODUCT_TYPES),
  season: z.string(),
  price: z.number(),
  primary_image_url: z.string().nullable(),
  status: z.enum(PRODUCT_STATUSES),
  sizes: z.array(z.string()),
  created_at: z.string().nullable(),
})
export type Product = z.infer<typeof productSchema>
