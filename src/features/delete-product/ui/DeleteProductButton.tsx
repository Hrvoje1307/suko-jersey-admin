import { useQueryClient } from '@tanstack/react-query'
import { Loader2Icon, Trash2Icon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { productKeys, useDeleteProduct, type Product } from '@/entities/product'
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

type DeleteProductButtonProps = {
  product: Pick<Product, 'id' | 'name'>
}

export function DeleteProductButton({ product }: DeleteProductButtonProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const deleteProduct = useDeleteProduct({
    onSuccess: () => {
      setOpen(false)
      toast.success(`Proizvod "${product.name}" je obrisan.`)
    },
    onError: (error) => {
      setOpen(false)
      toast.error(getDeleteErrorMessage(error))
    },
    // I nakon greške — 404 znači da je lista zastarjela.
    onSettled: () => queryClient.invalidateQueries({ queryKey: productKeys.all }),
  })

  return (
    <AlertDialog
      open={open}
      // Dok brisanje traje, Escape i klik izvan ne zatvaraju dijalog.
      onOpenChange={(next) => !deleteProduct.isPending && setOpen(next)}
    >
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
          <Trash2Icon />
          Obriši
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{`Obrisati proizvod "${product.name}"?`}</AlertDialogTitle>
          <AlertDialogDescription>Ovo je nepovratno.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteProduct.isPending}>Odustani</AlertDialogCancel>
          <AlertDialogAction
            className={buttonVariants({ variant: 'destructive' })}
            disabled={deleteProduct.isPending}
            onClick={(event) => {
              // Action inače odmah zatvara dijalog — zatvaramo ga tek kad API odgovori.
              event.preventDefault()
              deleteProduct.mutate(product.id)
            }}
          >
            {deleteProduct.isPending && <Loader2Icon className="animate-spin" />}
            Obriši
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
