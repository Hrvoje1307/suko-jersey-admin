import { z } from 'zod'
import {
  PRODUCT_CATEGORIES,
  PRODUCT_STATUSES,
  PRODUCT_TYPES,
  type Product,
} from '@/entities/product'

export const PAGE_SIZE = 20

export const PRODUCT_SORT_FIELDS = ['created_at', 'price'] as const
export type ProductSortField = (typeof PRODUCT_SORT_FIELDS)[number]

// Sve opcionalno i s .catch — ručno pokvaren URL pada na default umjesto
// na error stranicu, a link na /proizvodi ne mora slati nijedan param.
// Prazno znači default (najnoviji prvi, prva stranica), pa URL ostaje čist.
export const productsSearchSchema = z.object({
  q: z.string().trim().min(1).optional().catch(undefined),
  category: z.enum(PRODUCT_CATEGORIES).optional().catch(undefined),
  status: z.enum(PRODUCT_STATUSES).optional().catch(undefined),
  type: z.enum(PRODUCT_TYPES).optional().catch(undefined),
  sort: z.enum(PRODUCT_SORT_FIELDS).optional().catch(undefined),
  dir: z.enum(['asc', 'desc']).optional().catch(undefined),
  page: z.number().int().min(1).optional().catch(undefined),
})
export type ProductsSearch = z.infer<typeof productsSearchSchema>

export type ProductsSearchChange = (patch: Partial<ProductsSearch>) => void

export const CLEARED_FILTERS = {
  q: undefined,
  category: undefined,
  status: undefined,
  type: undefined,
  page: undefined,
} satisfies Partial<ProductsSearch>

export function hasActiveFilters({ q, category, status, type }: ProductsSearch): boolean {
  return Boolean(q || category || status || type)
}

// "sibenik" nađe "Šibenik"; đ se ne rastavlja pa ostaje kakav jest.
function normalize(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('hr')
}

export function filterProducts(products: Product[], search: ProductsSearch): Product[] {
  const needle = search.q ? normalize(search.q) : null

  return products.filter(
    (product) =>
      (!search.category || product.category === search.category) &&
      (!search.status || product.status === search.status) &&
      (!search.type || product.type === search.type) &&
      (!needle ||
        normalize(product.name).includes(needle) ||
        normalize(product.club_or_team).includes(needle)),
  )
}
