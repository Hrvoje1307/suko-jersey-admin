import { SearchIcon } from 'lucide-react'
import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { useDebouncedValue } from '@/shared/lib/hooks'
import { cn } from '@/shared/lib/utils'
import { Input } from './input'

const SEARCH_DEBOUNCE_MS = 300

type DebouncedSearchInputProps = {
  /** Vrijednost iz URL-a; undefined znači prazno. */
  value: string | undefined
  onChange: (value: string | undefined) => void
  placeholder: string
  className?: string
}

export function DebouncedSearchInput({
  value,
  onChange,
  placeholder,
  className,
}: DebouncedSearchInputProps) {
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
    <div className={cn('relative w-full sm:w-64', className)}>
      <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder={`${placeholder}…`}
        aria-label={placeholder}
        className="pl-8"
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
    </div>
  )
}
