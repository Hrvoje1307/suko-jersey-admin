import { Link } from '@tanstack/react-router'
import { ArrowLeftIcon } from 'lucide-react'
import { ProductForm } from '@/features/product-form'

export function ProductCreatePage() {
  return (
    <div className="grid max-w-4xl gap-6">
      <header className="grid gap-2">
        <Link
          to="/proizvodi"
          className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" />
          Proizvodi
        </Link>
        <h1 className="text-2xl font-semibold">Novi proizvod</h1>
        <p className="text-sm text-muted-foreground">
          Igrače za tisak dodaješ nakon kreiranja, na stranici za uređivanje.
        </p>
      </header>
      <ProductForm />
    </div>
  )
}
