import { useForm } from '@tanstack/react-form'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  orderKeys,
  orderStatusFormSchema,
  useUpdateOrderStatus,
  type OrderDetail,
  type OrderStatusFormValues,
} from '@/entities/order'
import { supplierShipmentKeys } from '@/entities/supplier-shipment'
import { getStatusErrorMessage } from './status-error'

function orderToFormValues(order: OrderDetail): OrderStatusFormValues {
  return {
    status: order.status,
    tracking_number_internal: order.tracking_number_internal ?? '',
  }
}

export function useOrderStatusForm(order: OrderDetail) {
  const queryClient = useQueryClient()

  // U stateu, a ne izračunato pri renderu: useForm na svakom renderu uspoređuje
  // defaultValues s onima iz reset() i vratio bi formu na stare vrijednosti.
  const [defaultValues, setDefaultValues] = useState(() => orderToFormValues(order))

  const updateStatus = useUpdateOrderStatus({
    onSuccess: (_updated, { payload }) => {
      // API mailom javlja samo promjenu statusa, ne i samog trackinga.
      const statusChanged = payload.status !== defaultValues.status
      toast.success(
        statusChanged ? 'Status je spremljen — kupcu je poslan email.' : 'Tracking broj je spremljen.',
      )
      // Odgovor je kratki oblik bez trackinga, pa forma preuzima poslano, a
      // detalj i lista se dohvaćaju ponovno.
      const values = {
        status: payload.status,
        tracking_number_internal: payload.tracking_number_internal ?? '',
      }
      setDefaultValues(values)
      form.reset(values)
      void queryClient.invalidateQueries({ queryKey: orderKeys.all })
      // Pošiljka čita koliko je odmakla iz statusa svojih narudžbi.
      void queryClient.invalidateQueries({ queryKey: supplierShipmentKeys.all })
    },
    onError: (error) => toast.error(getStatusErrorMessage(error)),
  })

  const form = useForm({
    defaultValues,
    validators: { onChange: orderStatusFormSchema },
    onSubmit: ({ value }) => {
      updateStatus.mutate({ id: order.id, payload: orderStatusFormSchema.parse(value) })
    },
  })

  return { form, updateStatus, savedStatus: defaultValues.status }
}
