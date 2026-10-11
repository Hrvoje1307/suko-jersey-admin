import { revalidateLogic, useForm } from '@tanstack/react-form'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  productFormSchema,
  productKeys,
  useCreateProduct,
  useUpdateProduct,
  type ProductDetail,
} from '@/entities/product'
import { emptyProductFormValues, productToFormValues } from './form-values'

type UseProductFormOptions = {
  /** Proizvod koji se uređuje; bez njega forma kreira novi. */
  product?: ProductDetail
}

export function useProductForm({ product }: UseProductFormOptions) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  // U stateu, a ne izračunato pri renderu: useForm na svakom renderu uspoređuje
  // defaultValues s onima iz reset() i vratio bi formu na stare vrijednosti.
  const [defaultValues, setDefaultValues] = useState(() =>
    product ? productToFormValues(product) : emptyProductFormValues,
  )

  const cacheSaved = (saved: ProductDetail) => {
    queryClient.setQueryData(productKeys.adminDetail(saved.id), saved)
    void queryClient.invalidateQueries({ queryKey: productKeys.adminList() })
  }

  const createProduct = useCreateProduct({
    onSuccess: (created) => {
      cacheSaved(created)
      toast.success(`Proizvod "${created.name}" je kreiran.`)
      // Igrači trebaju id proizvoda, pa se dodaju na stranici za uređivanje.
      // replace — back ne vraća na praznu formu.
      void navigate({
        to: '/proizvodi/$id/uredi',
        params: { id: String(created.id) },
        replace: true,
      })
    },
  })

  const updateProduct = useUpdateProduct({
    onSuccess: (updated) => {
      cacheSaved(updated)
      toast.success('Izmjene su spremljene.')
      // Forma preuzima ono što je API spremio (npr. sortirane veličine) i više
      // nije "dirty".
      const values = productToFormValues(updated)
      setDefaultValues(values)
      form.reset(values)
    },
  })

  const mutation = product ? updateProduct : createProduct

  const form = useForm({
    defaultValues,
    // Greške tek nakon prvog slanja, a onda se ažuriraju dok se tipka.
    validationLogic: revalidateLogic({ mode: 'submit', modeAfterSubmission: 'change' }),
    validators: { onDynamic: productFormSchema },
    onSubmit: ({ value }) => {
      // Validacija je već prošla; parse() pretvara upis u tijelo za API.
      const payload = productFormSchema.parse(value)
      if (product) {
        updateProduct.mutate({ id: product.id, payload })
      } else {
        createProduct.mutate(payload)
      }
    },
  })

  return { form, mutation, isEdit: product !== undefined }
}

export type ProductFormApi = ReturnType<typeof useProductForm>['form']
