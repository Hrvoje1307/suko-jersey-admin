import {
  CATEGORY_LABELS,
  PRODUCT_CATEGORIES,
  PRODUCT_STATUSES,
  PRODUCT_TYPE_LABELS,
  PRODUCT_TYPES,
  STATUS_LABELS,
} from '@/entities/product'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/shared/ui'
import type { ProductFormApi } from '../model/useProductForm'
import { FormField } from './FormField'

export function BasicsSection({ form }: { form: ProductFormApi }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Osnovno</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <form.Field name="name">
          {(field) => (
            <FormField
              id="product-name"
              label="Naziv"
              error={field.state.meta.errors[0]?.message}
              className="sm:col-span-2"
            >
              {(props) => (
                <Input
                  {...props}
                  placeholder="npr. Hajduk domaći dres 2025/26"
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                />
              )}
            </FormField>
          )}
        </form.Field>

        <form.Field name="club_or_team">
          {(field) => (
            <FormField
              id="product-club"
              label="Klub / tim"
              error={field.state.meta.errors[0]?.message}
              hint="Dohvat igrača radi samo za klubove mapirane na API-ju, pod identičnim nazivom."
            >
              {(props) => (
                <Input
                  {...props}
                  placeholder="npr. HNK Hajduk"
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                />
              )}
            </FormField>
          )}
        </form.Field>

        <form.Field name="season">
          {(field) => (
            <FormField
              id="product-season"
              label="Sezona"
              error={field.state.meta.errors[0]?.message}
              hint="Opcionalno. Za F1 godina, npr. 2025."
            >
              {(props) => (
                <Input
                  {...props}
                  placeholder="npr. 2025/26"
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                />
              )}
            </FormField>
          )}
        </form.Field>

        <form.Field name="category">
          {(field) => (
            <FormField id="product-category" label="Kategorija">
              {(props) => (
                <EnumSelect
                  {...props}
                  value={field.state.value}
                  options={PRODUCT_CATEGORIES}
                  labels={CATEGORY_LABELS}
                  onChange={field.handleChange}
                />
              )}
            </FormField>
          )}
        </form.Field>

        <form.Field name="type">
          {(field) => (
            <FormField id="product-type" label="Uzrast">
              {(props) => (
                <EnumSelect
                  {...props}
                  value={field.state.value}
                  options={PRODUCT_TYPES}
                  labels={PRODUCT_TYPE_LABELS}
                  onChange={field.handleChange}
                />
              )}
            </FormField>
          )}
        </form.Field>

        <form.Field name="price">
          {(field) => (
            <FormField id="product-price" label="Cijena" error={field.state.meta.errors[0]?.message}>
              {(props) => (
                <div className="relative">
                  <Input
                    {...props}
                    inputMode="decimal"
                    placeholder="89,99"
                    className="pr-8 tabular-nums"
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">
                    €
                  </span>
                </div>
              )}
            </FormField>
          )}
        </form.Field>

        <form.Field name="status">
          {(field) => (
            <FormField
              id="product-status"
              label="Status"
              hint="Skica se kupcima ne prikazuje."
            >
              {(props) => (
                <EnumSelect
                  {...props}
                  value={field.state.value}
                  options={PRODUCT_STATUSES}
                  labels={STATUS_LABELS}
                  onChange={field.handleChange}
                />
              )}
            </FormField>
          )}
        </form.Field>

        <form.Field name="description">
          {(field) => (
            <FormField
              id="product-description"
              label="Opis"
              error={field.state.meta.errors[0]?.message}
              className="sm:col-span-2"
            >
              {(props) => (
                <Textarea
                  {...props}
                  rows={4}
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

type EnumSelectProps<T extends string> = {
  id: string
  value: T
  options: readonly T[]
  labels: Record<T, string>
  onChange: (value: T) => void
  'aria-invalid'?: true
  'aria-describedby'?: string
}

function EnumSelect<T extends string>({
  value,
  options,
  labels,
  onChange,
  ...triggerProps
}: EnumSelectProps<T>) {
  return (
    // Radix vraća string; vrijednosti su uvijek iz options.
    <Select value={value} onValueChange={(next) => onChange(next as T)}>
      <SelectTrigger {...triggerProps} className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {labels[option]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
