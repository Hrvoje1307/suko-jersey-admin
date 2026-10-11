import { XIcon } from 'lucide-react'
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUSES,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUSES,
} from '@/entities/order'
import {
  Button,
  DebouncedSearchInput,
  FilterSelect,
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui'
import {
  CLEARED_FILTERS,
  hasActiveFilters,
  PAYMENT_FILTERS,
  type OrdersSearch,
  type OrdersSearchChange,
} from '../model/search'

type OrdersToolbarProps = {
  search: OrdersSearch
  onSearchChange: OrdersSearchChange
}

export function OrdersToolbar({ search, onSearchChange }: OrdersToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <DebouncedSearchInput
        placeholder="Pretraži referencu ili email"
        value={search.q}
        onChange={(q) => onSearchChange({ q, page: undefined })}
      />
      <FilterSelect
        label="Status"
        allLabel="Svi statusi"
        className="w-52"
        value={search.status}
        options={ORDER_STATUSES}
        labels={ORDER_STATUS_LABELS}
        onChange={(status) => onSearchChange({ status, page: undefined })}
      />
      <PaymentSelect
        value={search.payment}
        onChange={(payment) => onSearchChange({ payment, page: undefined })}
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

// Radix Select ne dopušta prazan string, a default (bez ?payment=) treba
// vlastitu stavku.
const HIDE_UNPAID = 'hide_unpaid'

type PaymentSelectProps = {
  value: OrdersSearch['payment']
  onChange: (value: OrdersSearch['payment']) => void
}

function PaymentSelect({ value, onChange }: PaymentSelectProps) {
  return (
    <Select
      value={value ?? HIDE_UNPAID}
      onValueChange={(next) => onChange(PAYMENT_FILTERS.find((filter) => filter === next))}
    >
      <SelectTrigger className="w-44" aria-label="Plaćanje">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={HIDE_UNPAID}>Bez neplaćenih</SelectItem>
        <SelectItem value="all">Sva plaćanja</SelectItem>
        <SelectSeparator />
        {PAYMENT_STATUSES.map((status) => (
          <SelectItem key={status} value={status}>
            {PAYMENT_STATUS_LABELS[status]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
