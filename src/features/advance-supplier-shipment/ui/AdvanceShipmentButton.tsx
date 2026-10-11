import { useQueryClient } from '@tanstack/react-query'
import { Loader2Icon, MailIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  ORDER_STATUS_CUSTOMER_LABELS,
  ORDER_STATUS_LABELS,
  orderKeys,
  PAYMENT_STATUS_LABELS,
} from '@/entities/order'
import {
  getShipmentProgress,
  supplierShipmentKeys,
  useAdvanceSupplierShipment,
  type SupplierShipment,
} from '@/entities/supplier-shipment'
import { formatCount } from '@/shared/lib'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
} from '@/shared/ui'
import { getAdvanceErrorMessage } from '../model/advance-error'

const ORDER_FORMS = { one: 'narudžbu', few: 'narudžbe', other: 'narudžbi' }
const CUSTOMER_FORMS = { one: 'kupac dobiva', few: 'kupca dobivaju', other: 'kupaca dobiva' }
const EMAIL_FORMS = { one: 'email', few: 'emaila', other: 'emailova' }

type AdvanceShipmentButtonProps = {
  shipment: SupplierShipment
}

// Jedan gumb za idući zajednički korak (Naručeno kod dobavljača → Stiglo u
// HR). Bez idućeg koraka ne prikazuje ništa.
export function AdvanceShipmentButton({ shipment }: AdvanceShipmentButtonProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const { nextStep, moving, skipped } = getShipmentProgress(shipment)

  const advance = useAdvanceSupplierShipment({
    onSuccess: (updated, { status }) => {
      setOpen(false)
      queryClient.setQueryData(supplierShipmentKeys.detail(updated.id), updated)
      const moved = moving.filter(
        (order) => updated.orders.find((saved) => saved.id === order.id)?.status === status,
      ).length
      toast.success(
        `Pošiljka je označena kao „${ORDER_STATUS_LABELS[status]}“ — poslano ${formatCount(moved, EMAIL_FORMS)}.`,
      )
    },
    onError: (error) => {
      setOpen(false)
      toast.error(getAdvanceErrorMessage(error))
    },
    // I nakon greške — API je možda već pomaknuo narudžbe prije nego što je pukao.
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: supplierShipmentKeys.all })
      void queryClient.invalidateQueries({ queryKey: orderKeys.all })
    },
  })

  if (!nextStep || moving.length === 0) return null

  return (
    <AlertDialog
      open={open}
      // Dok promjena traje, Escape i klik izvan ne zatvaraju dijalog.
      onOpenChange={(next) => !advance.isPending && setOpen(next)}
    >
      <AlertDialogTrigger asChild>
        <Button className="w-full">Označi: {ORDER_STATUS_LABELS[nextStep]}</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {`Označiti ${formatCount(moving.length, ORDER_FORMS)} kao „${ORDER_STATUS_LABELS[nextStep]}“?`}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="grid gap-3">
              <p className="flex gap-2">
                <MailIcon className="mt-0.5 size-4 shrink-0" />
                <span>
                  {`${formatCount(moving.length, CUSTOMER_FORMS)} email s novim statusom „${ORDER_STATUS_CUSTOMER_LABELS[nextStep]}“.`}
                </span>
              </p>
              <ul className="flex flex-wrap gap-1.5">
                {moving.map((order) => (
                  <li key={order.id} className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                    {order.order_reference}
                  </li>
                ))}
              </ul>
              {skipped.length > 0 && (
                <p>
                  Ne mijenjaju se:{' '}
                  {skipped
                    .map((order) => `${order.order_reference} (${PAYMENT_STATUS_LABELS[order.payment_status]})`)
                    .join(', ')}
                  .
                </p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={advance.isPending}>Odustani</AlertDialogCancel>
          <AlertDialogAction
            disabled={advance.isPending}
            onClick={(event) => {
              // Action inače odmah zatvara dijalog — zatvaramo ga tek kad API odgovori.
              event.preventDefault()
              advance.mutate({ id: shipment.id, status: nextStep })
            }}
          >
            {advance.isPending && <Loader2Icon className="animate-spin" />}
            Označi i pošalji emailove
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
