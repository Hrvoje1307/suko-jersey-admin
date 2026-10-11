import { cn } from '@/shared/lib/utils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'

// Radix Select ne dopušta prazan string kao vrijednost stavke.
const ALL = 'all'

type FilterSelectProps<T extends string> = {
  label: string
  allLabel: string
  value: T | undefined
  options: readonly T[]
  labels: Record<T, string>
  onChange: (value: T | undefined) => void
  className?: string
}

export function FilterSelect<T extends string>({
  label,
  allLabel,
  value,
  options,
  labels,
  onChange,
  className,
}: FilterSelectProps<T>) {
  return (
    <Select
      value={value ?? ALL}
      onValueChange={(next) => onChange(options.find((option) => option === next))}
    >
      <SelectTrigger className={cn('w-40', className)} aria-label={label}>
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
