type ProductEditPageProps = {
  productId: string
}

export function ProductEditPage({ productId }: ProductEditPageProps) {
  return <h1 className="text-2xl font-semibold">Uredi proizvod #{productId}</h1>
}
