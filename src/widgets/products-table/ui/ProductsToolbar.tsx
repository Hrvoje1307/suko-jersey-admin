import { XIcon } from 'lucide-react'
import {
  CATEGORY_LABELS,
  PRODUCT_CATEGORIES,
  PRODUCT_STATUSES,
  PRODUCT_TYPE_LABELS,
  PRODUCT_TYPES,
  STATUS_LABELS,
} from '@/entities/product'
import { Button, DebouncedSearchInput, FilterSelect } from '@/shared/ui'
import {
  CLEARED_FILTERS,
  hasActiveFilters,
  type ProductsSearch,
  type ProductsSearchChange,
} from '../model/search'

type ProductsToolbarProps = {
  search: ProductsSearch
  onSearchChange: ProductsSearchChange
}

export function ProductsToolbar({ search, onSearchChange }: ProductsToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <DebouncedSearchInput
        placeholder="Pretraži naziv ili klub"
        value={search.q}
        onChange={(q) => onSearchChange({ q, page: undefined })}
      />
      <FilterSelect
        label="Kategorija"
        allLabel="Sve kategorije"
        value={search.category}
        options={PRODUCT_CATEGORIES}
        labels={CATEGORY_LABELS}
        onChange={(category) => onSearchChange({ category, page: undefined })}
      />
      <FilterSelect
        label="Status"
        allLabel="Svi statusi"
        value={search.status}
        options={PRODUCT_STATUSES}
        labels={STATUS_LABELS}
        onChange={(status) => onSearchChange({ status, page: undefined })}
      />
      <FilterSelect
        label="Uzrast"
        allLabel="Odrasli i djeca"
        value={search.type}
        options={PRODUCT_TYPES}
        labels={PRODUCT_TYPE_LABELS}
        onChange={(type) => onSearchChange({ type, page: undefined })}
      />
      {hasActiveFilters(search) && (
        <Button variant="ghost" onClick={() => onSearchChange(CLEARED_FILTERS)}>
          <XIcon />
          Očisti
        </Button>
      )}
    </div>
  )
}
