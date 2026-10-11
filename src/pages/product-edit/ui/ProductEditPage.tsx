import { Link } from '@tanstack/react-router'
import { ArrowLeftIcon, RotateCwIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { ProductStatusBadge, useAdminProduct } from '@/entities/product'
import { ProductPlayersSection } from '@/features/manage-product-players'
import { ProductForm } from '@/features/product-form'
import { isApiError } from '@/shared/api'
import { Button, Skeleton } from '@/shared/ui'

type ProductEditPageProps = {
  productId: string
}

export function ProductEditPage({ productId }: ProductEditPageProps) {
  const id = Number(productId)
  if (!Number.isInteger(id) || id <= 0) {
    return <ProductNotFound />
  }
  return <ProductEditor id={id} />
}

function ProductEditor({ id }: { id: number }) {
  const { data: product, error, isPending, isError, isRefetching, refetch } = useAdminProduct(id)

  if (isPending) {
    return (
      <PageLayout title="Uredi proizvod">
        <EditorSkeleton />
      </PageLayout>
    )
  }

  if (isError) {
    if (isApiError(error) && error.response?.status === 404) {
      return <ProductNotFound />
    }
    return (
      <PageLayout title="Uredi proizvod">
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed px-6 py-12 text-center">
          <p className="font-medium">Proizvod se nije uspio učitati.</p>
          <Button variant="outline" disabled={isRefetching} onClick={() => void refetch()}>
            <RotateCwIcon className={isRefetching ? 'animate-spin' : undefined} />
            Pokušaj ponovno
          </Button>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title={product.name}
      meta={
        <>
          <ProductStatusBadge status={product.status} />
          <span>#{product.id}</span>
        </>
      }
    >
      {/* key: forme drže svoje stanje i ne prate kasnije promjene propa. */}
      <ProductForm key={product.id} product={product} />
      <ProductPlayersSection key={`players-${product.id}`} product={product} />
    </PageLayout>
  )
}

type PageLayoutProps = {
  title: string
  meta?: ReactNode
  children: ReactNode
}

function PageLayout({ title, meta, children }: PageLayoutProps) {
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
        <h1 className="text-2xl font-semibold">{title}</h1>
        {meta && <div className="flex items-center gap-2 text-sm text-muted-foreground">{meta}</div>}
      </header>
      {children}
    </div>
  )
}

function EditorSkeleton() {
  return (
    <div className="grid gap-6" aria-busy aria-label="Učitavanje proizvoda">
      {[0, 1, 2].map((section) => (
        <div key={section} className="grid gap-4 rounded-xl border p-6">
          <Skeleton className="h-5 w-32" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-9" />
            <Skeleton className="h-9" />
            <Skeleton className="h-9" />
            <Skeleton className="h-9" />
          </div>
        </div>
      ))}
    </div>
  )
}

function ProductNotFound() {
  return (
    <PageLayout title="Proizvod nije pronađen">
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed px-6 py-12 text-center">
        <p className="text-sm text-muted-foreground">
          Proizvod ne postoji ili je obrisan.
        </p>
        <Button asChild variant="outline">
          <Link to="/proizvodi">Natrag na proizvode</Link>
        </Button>
      </div>
    </PageLayout>
  )
}
