import { ShirtIcon } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/shared/lib'

type ProductThumbProps = {
  src: string | null
  alt: string
  className?: string
}

export function ProductThumb({ src, alt, className }: ProductThumbProps) {
  // Pamti koji URL je pukao, a ne samo da je pukao — nova slika (drugi src)
  // dobiva novu priliku bez resetiranja stanja.
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const showImage = src !== null && src !== failedSrc

  return (
    <div
      className={cn(
        'flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted',
        className,
      )}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="size-full object-cover"
          onError={() => setFailedSrc(src)}
        />
      ) : (
        <ShirtIcon className="size-5 text-muted-foreground" aria-label={alt} />
      )}
    </div>
  )
}
