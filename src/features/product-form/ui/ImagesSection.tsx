import { ArrowDownIcon, ArrowUpIcon, PlusIcon, StarIcon, XIcon } from 'lucide-react'
import { useState } from 'react'
import { PRODUCT_IMAGES_MAX, ProductThumb, productUrlSchema } from '@/entities/product'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  FormField,
  Input,
  Label,
} from '@/shared/ui'
import type { ProductFormApi } from '../model/useProductForm'

// API ne prima datoteke — slike su vanjski URL-ovi (npr. CDN) i šalju se
// s proizvodom, pa se mogu dodati već pri kreiranju.
export function ImagesSection({ form }: { form: ProductFormApi }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Slike i 3D model</CardTitle>
        <CardDescription>
          Prva slika je glavna — prikazuje se u listi i na kartici proizvoda.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <form.Field name="images" mode="array">
          {(field) => {
            const images = field.state.value
            const error = field.state.meta.errors[0]?.message
            return (
              <div className="grid gap-4">
                {images.length > 0 ? (
                  <ol className="grid gap-2">
                    {images.map((url, index) => (
                      <form.Field key={index} name={`images[${index}]`}>
                        {(imageField) => (
                          <li className="flex items-center gap-3 rounded-md border p-2">
                            <ProductThumb src={url} alt={`Slika ${index + 1}`} className="size-16" />
                            <div className="grid min-w-0 flex-1 gap-1">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                {index + 1}.
                                {index === 0 && <Badge>Glavna</Badge>}
                              </div>
                              <a
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className="truncate text-sm hover:underline"
                              >
                                {url}
                              </a>
                              {imageField.state.meta.errors[0] && (
                                <p className="text-sm text-destructive">
                                  {imageField.state.meta.errors[0].message}
                                </p>
                              )}
                            </div>
                            <div className="flex shrink-0 items-center gap-1">
                              {index > 0 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  aria-label={`Postavi sliku ${index + 1} kao glavnu`}
                                  onClick={() => field.moveValue(index, 0)}
                                >
                                  <StarIcon />
                                  <span className="hidden sm:inline">Postavi kao glavnu</span>
                                </Button>
                              )}
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                aria-label={`Pomakni sliku ${index + 1} gore`}
                                disabled={index === 0}
                                onClick={() => field.moveValue(index, index - 1)}
                              >
                                <ArrowUpIcon />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                aria-label={`Pomakni sliku ${index + 1} dolje`}
                                disabled={index === images.length - 1}
                                onClick={() => field.moveValue(index, index + 1)}
                              >
                                <ArrowDownIcon />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                className="text-destructive hover:text-destructive"
                                aria-label={`Ukloni sliku ${index + 1}`}
                                onClick={() => field.removeValue(index)}
                              >
                                <XIcon />
                              </Button>
                            </div>
                          </li>
                        )}
                      </form.Field>
                    ))}
                  </ol>
                ) : (
                  <p className="rounded-md border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                    Još nema slika. Bez slike se u listi prikazuje ikona dresa.
                  </p>
                )}
                <AddImageInput images={images} onAdd={(url) => field.pushValue(url)} />
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>
            )
          }}
        </form.Field>

        <form.Field name="model_3d_url">
          {(field) => (
            <FormField
              id="product-model-3d"
              label="3D model"
              error={field.state.meta.errors[0]?.message}
              hint="Opcionalno. Link na GLB model za 360° prikaz."
            >
              {(props) => (
                <Input
                  {...props}
                  type="url"
                  placeholder="https://…/dres.glb"
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                />
              )}
            </FormField>
          )}
        </form.Field>
      </CardContent>
    </Card>
  )
}

type AddImageInputProps = {
  images: string[]
  onAdd: (url: string) => void
}

function AddImageInput({ images, onAdd }: AddImageInputProps) {
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)
  const isFull = images.length >= PRODUCT_IMAGES_MAX

  const add = () => {
    const url = draft.trim()
    const result = productUrlSchema.safeParse(url)
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Neispravan URL.')
      return
    }
    // API odbija duplikate.
    if (images.includes(url)) {
      setError('Ta slika je već dodana.')
      return
    }
    onAdd(url)
    setDraft('')
    setError(null)
  }

  return (
    <div className="grid gap-2">
      <Label htmlFor="product-image-url">Dodaj sliku</Label>
      <div className="flex gap-2">
        <Input
          id="product-image-url"
          type="url"
          placeholder="https://…"
          value={draft}
          disabled={isFull}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'product-image-url-error' : undefined}
          onChange={(event) => {
            setDraft(event.target.value)
            setError(null)
          }}
          onKeyDown={(event) => {
            // Enter bi inače poslao cijelu formu.
            if (event.key === 'Enter') {
              event.preventDefault()
              add()
            }
          }}
        />
        <Button type="button" variant="outline" disabled={isFull || !draft.trim()} onClick={add}>
          <PlusIcon />
          Dodaj
        </Button>
      </div>
      {error ? (
        <p id="product-image-url-error" className="text-sm text-destructive">
          {error}
        </p>
      ) : (
        isFull && (
          <p className="text-sm text-muted-foreground">
            Dosegnut je maksimum od {PRODUCT_IMAGES_MAX} slika.
          </p>
        )
      )}
    </div>
  )
}
