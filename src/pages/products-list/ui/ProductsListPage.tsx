import { Link } from '@tanstack/react-router'
import { PlusIcon } from 'lucide-react'
import { Button } from '@/shared/ui'
import {
  ProductsTable,
  type ProductsSearch,
  type ProductsSearchChange,
} from '@/widgets/products-table'

type ProductsListPageProps = {
  search: ProductsSearch
  onSearchChange: ProductsSearchChange
}

export function ProductsListPage({ search, onSearchChange }: ProductsListPageProps) {
  return (
    <div className="grid gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Proizvodi</h1>
        <Button asChild>
          <Link to="/proizvodi/novi">
            <PlusIcon />
            Novi proizvod
          </Link>
        </Button>
      </header>
      <ProductsTable search={search} onSearchChange={onSearchChange} />
    </div>
  )
}
