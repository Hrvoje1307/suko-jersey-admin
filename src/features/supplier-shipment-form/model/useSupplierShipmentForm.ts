import { revalidateLogic, useForm } from '@tanstack/react-form'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import { orderKeys } from '@/entities/order'
import {
  formatShipmentName,
  supplierShipmentFormSchema,
  supplierShipmentKeys,
  useCreateSupplierShipment,
  useUpdateSupplierShipment,
  type SupplierShipment,
} from '@/entities/supplier-shipment'
import { emptyShipmentFormValues, shipmentToFormValues } from './form-values'

type UseSupplierShipmentFormOptions = {
  /** Pošiljka koja se uređuje; bez nje forma kreira novu. */
  shipment?: SupplierShipment
}

export function useSupplierShipmentForm({ shipment }: UseSupplierShipmentFormOptions) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  // U stateu, a ne izračunato pri renderu: useForm na svakom renderu uspoređuje
  // defaultValues s onima iz reset() i vratio bi formu na stare vrijednosti.
  const [defaultValues, setDefaultValues] = useState(() =>
    shipment ? shipmentToFormValues(shipment) : emptyShipmentFormValues,
  )

  const cacheSaved = (saved: SupplierShipment) => {
    queryClient.setQueryData(supplierShipmentKeys.detail(saved.id), saved)
    void queryClient.invalidateQueries({ queryKey: supplierShipmentKeys.list() })
    // Lista i detalj narudžbe pokazuju u kojoj je pošiljci.
    void queryClient.invalidateQueries({ queryKey: orderKeys.all })
  }

  const createShipment = useCreateSupplierShipment({
    onSuccess: (created) => {
      cacheSaved(created)
      toast.success(`${formatShipmentName(created)} je kreirana.`)
      // replace — back ne vraća na praznu formu.
      void navigate({ to: '/posiljke/$id', params: { id: String(created.id) }, replace: true })
    },
  })

  const updateShipment = useUpdateSupplierShipment({
    onSuccess: (updated) => {
      cacheSaved(updated)
      toast.success('Izmjene su spremljene.')
      const values = shipmentToFormValues(updated)
      setDefaultValues(values)
      form.reset(values)
    },
  })

  const mutation = shipment ? updateShipment : createShipment

  const form = useForm({
    defaultValues,
    // Greške tek nakon prvog slanja, a onda se ažuriraju dok se tipka.
    validationLogic: revalidateLogic({ mode: 'submit', modeAfterSubmission: 'change' }),
    validators: { onDynamic: supplierShipmentFormSchema },
    onSubmit: ({ value }) => {
      const payload = supplierShipmentFormSchema.parse(value)
      if (shipment) {
        updateShipment.mutate({ id: shipment.id, payload })
      } else {
        createShipment.mutate(payload)
      }
    },
  })

  return { form, mutation, savedOrderIds: defaultValues.order_ids }
}

export type SupplierShipmentFormApi = ReturnType<typeof useSupplierShipmentForm>['form']
