import { createFileRoute } from '@tanstack/react-router'
import { ProductsListPage } from '@/pages/products-list'

export const Route = createFileRoute('/_authenticated/proizvodi/')({
  component: ProductsListPage,
})
