import type { CellData, Column } from '@tanstack/react-table'
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from 'lucide-react'
import type { Product } from '@/entities/product'
import { Button } from '@/shared/ui'
import type { productTableFeatures } from '../model/table-features'

type SortableHeaderProps<TValue extends CellData> = {
  column: Column<typeof productTableFeatures, Product, TValue>
  label: string
}

export function SortableHeader<TValue extends CellData>({
  column,
  label,
}: SortableHeaderProps<TValue>) {
  const sorted = column.getIsSorted()
  const Icon = sorted === 'asc' ? ArrowUpIcon : sorted === 'desc' ? ArrowDownIcon : ArrowUpDownIcon

  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8"
      onClick={column.getToggleSortingHandler()}
    >
      {label}
      <Icon className={sorted ? undefined : 'text-muted-foreground'} />
    </Button>
  )
}
