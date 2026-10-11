import { Link } from '@tanstack/react-router'
import { Loader2Icon } from 'lucide-react'
import type { ProductDetail } from '@/entities/product'
import { Button } from '@/shared/ui'
import { getSaveErrorMessage } from '../model/save-error'
import { useProductForm } from '../model/useProductForm'
import { BasicsSection } from './BasicsSection'
import { ImagesSection } from './ImagesSection'
import { SizesSection } from './SizesSection'

type ProductFormProps = {
  /** Proizvod koji se uređuje; bez njega forma kreira novi. */
  product?: ProductDetail
}

export function ProductForm({ product }: ProductFormProps) {
  const { form, mutation, isEdit } = useProductForm({ product })

  return (
    <form
      noValidate
      className="grid gap-6"
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <BasicsSection form={form} />
      <SizesSection form={form} />
      <ImagesSection form={form} />

      <form.Subscribe selector={(state) => state.submissionAttempts > 0 && !state.isValid}>
        {(hasErrors) =>
          hasErrors && (
            <p role="alert" className="text-sm text-destructive">
              Provjeri označena polja.
            </p>
          )
        }
      </form.Subscribe>

      {mutation.isError && (
        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {getSaveErrorMessage(mutation.error)}
        </p>
      )}

      <div className="flex flex-wrap justify-end gap-2">
        <Button asChild variant="outline">
          <Link to="/proizvodi">Odustani</Link>
        </Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending && <Loader2Icon className="animate-spin" />}
          {isEdit ? 'Spremi izmjene' : 'Kreiraj proizvod'}
        </Button>
      </div>
    </form>
  )
}
