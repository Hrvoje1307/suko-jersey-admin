import { Loader2Icon, RotateCwIcon } from 'lucide-react'
import { isApiError } from '@/shared/api'
import { cn } from '@/shared/lib'
import { Button } from './button'

type LoadErrorProps = {
  title: string
  error: Error
  isRetrying: boolean
  onRetry: () => void
  className?: string
}

// Greška dohvata unutar kartice ili sekcije, s gumbom za ponovni pokušaj.
export function LoadError({ title, error, isRetrying, onRetry, className }: LoadErrorProps) {
  const offline = isApiError(error) && !error.response

  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-md border border-destructive/30 bg-destructive/5 px-6 py-8 text-center',
        className,
      )}
    >
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">
          {offline ? 'Server nije dostupan. Provjeri vezu.' : 'Došlo je do greške na serveru.'}
        </p>
      </div>
      <Button variant="outline" disabled={isRetrying} onClick={onRetry}>
        {isRetrying ? <Loader2Icon className="animate-spin" /> : <RotateCwIcon />}
        Pokušaj ponovno
      </Button>
    </div>
  )
}
