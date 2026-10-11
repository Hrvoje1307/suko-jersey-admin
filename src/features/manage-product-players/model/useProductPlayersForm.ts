import { revalidateLogic, useForm } from '@tanstack/react-form'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  productKeys,
  productPlayersFormSchema,
  useFetchPlayers,
  useSavePlayers,
  type ProductDetail,
  type ProductPlayer,
} from '@/entities/product'
import { playersToFormValues } from './form-values'
import { getSavePlayersErrorMessage } from './players-error'

export function useProductPlayersForm(product: ProductDetail) {
  const queryClient = useQueryClient()

  // U stateu iz istog razloga kao u formi proizvoda: useForm bi inače nakon
  // reset() vratio stare defaultValues.
  const [defaultValues, setDefaultValues] = useState(() =>
    playersToFormValues(product.available_players),
  )

  // Oba endpointa vraćaju konačnu listu (s `source`), pa ona postaje nova
  // polazna točka forme.
  const applyServerPlayers = (players: ProductPlayer[]) => {
    const values = playersToFormValues(players)
    setDefaultValues(values)
    form.reset(values)
    // Detalj nosi available_players; forma ga ne čita ponovno, ali povratak na
    // stranicu ne smije pokazati staro stanje.
    void queryClient.invalidateQueries({ queryKey: productKeys.adminDetail(product.id) })
  }

  const fetchPlayers = useFetchPlayers({
    onSuccess: (players) => {
      applyServerPlayers(players)
      toast.success(`Roster je dohvaćen (igrača: ${players.length}).`)
    },
  })

  const savePlayers = useSavePlayers({
    onSuccess: (players) => {
      applyServerPlayers(players)
      toast.success('Igrači su spremljeni.')
    },
    onError: (error) => toast.error(getSavePlayersErrorMessage(error)),
  })

  const form = useForm({
    defaultValues,
    validationLogic: revalidateLogic({ mode: 'submit', modeAfterSubmission: 'change' }),
    validators: { onDynamic: productPlayersFormSchema },
    onSubmit: ({ value }) => {
      const { players } = productPlayersFormSchema.parse(value)
      fetchPlayers.reset()
      savePlayers.mutate({ productId: product.id, players })
    },
  })

  return { form, fetchPlayers, savePlayers }
}
