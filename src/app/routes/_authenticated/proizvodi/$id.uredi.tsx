import { createFileRoute } from '@tanstack/react-router'
import { ProductEditPage } from '@/pages/product-edit'

export const Route = createFileRoute('/_authenticated/proizvodi/$id/uredi')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  return <ProductEditPage productId={id} />
}
