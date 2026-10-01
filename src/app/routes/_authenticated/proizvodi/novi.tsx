import { createFileRoute } from '@tanstack/react-router'
import { ProductCreatePage } from '@/pages/product-create'

export const Route = createFileRoute('/_authenticated/proizvodi/novi')({
  component: ProductCreatePage,
})
