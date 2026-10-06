import { SearchIcon, XIcon } from 'lucide-react'
import { useEffect, useEffectEvent, useRef, useState } from 'react'
import {
  CATEGORY_LABELS,
  PRODUCT_CATEGORIES,
  PRODUCT_STATUSES,
  PRODUCT_TYPE_LABELS,
  PRODUCT_TYPES,
  STATUS_LABELS,
} from '@/entities/product'
import { useDebouncedValue } from '@/shared/lib'
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui'
import {
  CLEARED_FILTERS,
  hasActiveFilters,
  type ProductsSearch,
  type ProductsSearchChange,
} from '../model/search'

const SEARCH_DEBOUNCE_MS = 300

type ProductsToolbarProps = {
  search: ProductsSearch
  onSearchChange: ProductsSearchChange
}

export function ProductsToolbar({ search, onSearchChange }: ProductsToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <SearchInput value={search.q} onChange={(q) => onSearchChange({ q, page: undefined })} />
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

type SearchInputProps = {
  value: string | undefined
  onChange: (value: string | undefined) => void
}

function SearchInput({ value, onChange }: SearchInputProps) {
  const [text, setText] = useState(value ?? '')
  const debounced = useDebouncedValue(text.trim(), SEARCH_DEBOUNCE_MS)
  // Zadnja vrijednost koju je input upisao u URL. Po njoj se vlastita promjena
  // razlikuje od vanjske (back/forward, "Očisti") — inače bi URL koji kasni
  // za tipkanjem pregazio slova upisana u međuvremenu.
  const pushed = useRef(value ?? '')
  const emitChange = useEffectEvent(onChange)

  useEffect(() => {
    if (debounced === pushed.current) return
    pushed.current = debounced
    emitChange(debounced || undefined)
  }, [debounced])

  useEffect(() => {
    const next = value ?? ''
    if (next === pushed.current) return
    pushed.current = next
    setText(next)
  }, [value])

  return (
    <div className="relative w-full sm:w-64">
      <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Pretraži naziv ili klub…"
        aria-label="Pretraži naziv ili klub"
        className="pl-8"
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
    </div>
  )
}

// Radix Select ne dopušta prazan string kao vrijednost stavke.
const ALL = 'all'

type FilterSelectProps<T extends string> = {
  label: string
  allLabel: string
  value: T | undefined
  options: readonly T[]
  labels: Record<T, string>
  onChange: (value: T | undefined) => void
}

function FilterSelect<T extends string>({
  label,
  allLabel,
  value,
  options,
  labels,
  onChange,
}: FilterSelectProps<T>) {
  return (
    <Select
      value={value ?? ALL}
      onValueChange={(next) => onChange(options.find((option) => option === next))}
    >
      <SelectTrigger className="w-40" aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{allLabel}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {labels[option]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
