import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { Loader2Icon, Trash2Icon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { orderKeys } from '@/entities/order'
import {
  formatShipmentName,
  supplierShipmentKeys,
  useDeleteSupplierShipment,
  type SupplierShipment,
} from '@/entities/supplier-shipment'
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
  buttonVariants,
} from '@/shared/ui'
import { getDeleteErrorMessage } from '../model/delete-error'

type DeleteShipmentButtonProps = {
  shipment: Pick<SupplierShipment, 'id'>
}

export function DeleteShipmentButton({ shipment }: DeleteShipmentButtonProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const name = formatShipmentName(shipment)

  const deleteShipment = useDeleteSupplierShipment({
    onSuccess: () => {
      setOpen(false)
      toast.success(`${name} je obrisana.`)
      // Detalj se izbacuje iz cachea tek nakon odlaska sa stranice — inače
      // bi ga otvorena stranica odmah ponovno dohvatila i dobila 404.
      void navigate({ to: '/posiljke' }).then(() =>
        queryClient.removeQueries({ queryKey: supplierShipmentKeys.detail(shipment.id) }),
      )
    },
    onError: (error) => {
      setOpen(false)
      toast.error(getDeleteErrorMessage(error))
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: supplierShipmentKeys.list() })
      void queryClient.invalidateQueries({ queryKey: orderKeys.all })
    },
  })

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => !deleteShipment.isPending && setOpen(next)}
    >
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
          <Trash2Icon />
          Obriši
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{`Obrisati pošiljku #${shipment.id}?`}</AlertDialogTitle>
          <AlertDialogDescription>
            Narudžbe ostaju sa svojim statusom, samo izlaze iz pošiljke. Kupci ne dobivaju email.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteShipment.isPending}>Odustani</AlertDialogCancel>
          <AlertDialogAction
            className={buttonVariants({ variant: 'destructive' })}
            disabled={deleteShipment.isPending}
            onClick={(event) => {
              event.preventDefault()
              deleteShipment.mutate(shipment.id)
            }}
          >
            {deleteShipment.isPending && <Loader2Icon className="animate-spin" />}
            Obriši
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
