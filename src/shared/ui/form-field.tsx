import type { ReactNode } from 'react'
import { cn } from '@/shared/lib'
import { Label } from './label'

type ControlProps = {
  id: string
  'aria-invalid': true | undefined
  'aria-describedby': string | undefined
}

type FormFieldProps = {
  id: string
  label: string
  error?: string
  hint?: string
  className?: string
  children: (props: ControlProps) => ReactNode
}

export function FormField({ id, label, error, hint, className, children }: FormFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className={cn('grid content-start gap-2', className)}>
      <Label htmlFor={id}>{label}</Label>
      {children({ id, 'aria-invalid': error ? true : undefined, 'aria-describedby': describedBy })}
      {hint && (
        <p id={hintId} className="text-sm text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
