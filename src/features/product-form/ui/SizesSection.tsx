import { CheckIcon } from 'lucide-react'
import { SIZE_PRESETS } from '@/entities/product'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui'
import type { ProductFormApi } from '../model/useProductForm'

const SIZE_ORDER = [...SIZE_PRESETS.adult, ...SIZE_PRESETS.kids]

// Samo radi urednog prikaza (API ionako sortira); nepoznate veličine idu na
// kraj redom kojim su dodane.
function sortSizes(sizes: string[]): string[] {
  const rank = (size: string) => {
    const index = SIZE_ORDER.indexOf(size)
    return index === -1 ? SIZE_ORDER.length : index
  }
  return [...sizes].sort((a, b) => rank(a) - rank(b))
}

export function SizesSection({ form }: { form: ProductFormApi }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle id="product-sizes-title">Veličine</CardTitle>
        <CardDescription>
          Zalihe nema — sve odabrane veličine su uvijek dostupne. Nedostupnu veličinu samo odznači.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form.Subscribe selector={(state) => state.values.type}>
          {(type) => (
            <form.Field name="sizes">
              {(field) => {
                const selected = field.state.value
                const presets = SIZE_PRESETS[type]
                // Veličine izvan ponude (druga dob ili stari unos) ostaju vidljive
                // dok ih admin ne makne — inače bi ih PUT tiho obrisao.
                const extra = selected.filter((size) => !presets.includes(size))
                const error = field.state.meta.errors[0]?.message

                const toggle = (size: string) =>
                  field.handleChange(
                    selected.includes(size)
                      ? selected.filter((s) => s !== size)
                      : sortSizes([...selected, size]),
                  )

                return (
                  <div className="grid gap-3">
                    <div
                      role="group"
                      aria-labelledby="product-sizes-title"
                      aria-describedby={error ? 'product-sizes-error' : undefined}
                      className="flex flex-wrap gap-2"
                    >
                      {[...presets, ...extra].map((size) => {
                        const isSelected = selected.includes(size)
                        return (
                          <Button
                            key={size}
                            type="button"
                            size="sm"
                            variant={isSelected ? 'default' : 'outline'}
                            aria-pressed={isSelected}
                            className="min-w-14"
                            onClick={() => toggle(size)}
                          >
                            {isSelected && <CheckIcon />}
                            {size}
                          </Button>
                        )
                      })}
                    </div>
                    {extra.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        {extra.length === 1
                          ? `Veličina ${extra[0]} nije u ponudi za odabrani uzrast — ostaje dok je ne odznačiš.`
                          : `Veličine ${extra.join(', ')} nisu u ponudi za odabrani uzrast — ostaju dok ih ne odznačiš.`}
                      </p>
                    )}
                    {error && (
                      <p id="product-sizes-error" className="text-sm text-destructive">
                        {error}
                      </p>
                    )}
                  </div>
                )
              }}
            </form.Field>
          )}
        </form.Subscribe>
      </CardContent>
    </Card>
  )
}
