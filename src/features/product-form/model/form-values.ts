import type { ProductDetail, ProductFormValues } from '@/entities/product'

export const emptyProductFormValues: ProductFormValues = {
  name: '',
  club_or_team: '',
  category: 'football',
  type: 'adult',
  season: '',
  price: '',
  description: '',
  sizes: [],
  images: [],
  model_3d_url: '',
  status: 'draft',
}

export function productToFormValues(product: ProductDetail): ProductFormValues {
  return {
    name: product.name,
    club_or_team: product.club_or_team,
    category: product.category,
    type: product.type,
    season: product.season ?? '',
    // Decimalni zarez, kako admin cijenu i upisuje.
    price: String(product.price).replace('.', ','),
    description: product.description ?? '',
    sizes: product.sizes,
    images: product.images,
    model_3d_url: product.model_3d_url ?? '',
    status: product.status,
  }
}
