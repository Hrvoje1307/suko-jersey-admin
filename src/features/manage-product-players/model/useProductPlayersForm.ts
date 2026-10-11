import { revalidateLogic, useForm } from '@tanstack/react-form'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  productKeys,
  productPlayersFormSchema,
  useSavePlayers,
  type ProductDetail,
} from '@/entities/product'
import { readTextFile } from '@/shared/lib'
import { playersToFormValues } from './form-values'
import { getSavePlayersErrorMessage } from './players-error'
import { parsePlayersCsv } from './players-csv'

const CSV_MAX_BYTES = 1_000_000

export type CsvImportState =
  | { status: 'imported'; fileName: string; count: number; skipped: string[] }
  | { status: 'error'; fileName: string; error: string }

export function useProductPlayersForm(product: ProductDetail) {
  const queryClient = useQueryClient()
  const [csvImport, setCsvImport] = useState<CsvImportState | null>(null)

  // U stateu iz istog razloga kao u formi proizvoda: useForm bi inače nakon
  // reset() vratio stare defaultValues.
  const [defaultValues, setDefaultValues] = useState(() =>
    playersToFormValues(product.available_players),
  )

  const savePlayers = useSavePlayers({
    onSuccess: (players) => {
      // API vraća konačnu listu (s id-jevima novih), pa ona postaje nova
      // polazna točka forme.
      const values = playersToFormValues(players)
      setDefaultValues(values)
      form.reset(values)
      setCsvImport(null)
      // Detalj nosi available_players; forma ga ne čita ponovno, ali povratak
      // na stranicu ne smije pokazati staro stanje.
      void queryClient.invalidateQueries({ queryKey: productKeys.adminDetail(product.id) })
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
      savePlayers.mutate({ productId: product.id, players })
    },
  })

  // CSV zamjenjuje cijelu listu u formi, ali ništa ne sprema — admin pregleda
  // pa spremi ili odbaci.
  const importCsv = async (file: File) => {
    if (file.size > CSV_MAX_BYTES) {
      setCsvImport({ status: 'error', fileName: file.name, error: 'Datoteka je veća od 1 MB.' })
      return
    }
    let text: string
    try {
      text = await readTextFile(file)
    } catch {
      setCsvImport({ status: 'error', fileName: file.name, error: 'Datoteku nije moguće pročitati.' })
      return
    }
    const result = parsePlayersCsv(text)
    if (!result.ok) {
      setCsvImport({ status: 'error', fileName: file.name, error: result.error })
      return
    }
    form.setFieldValue('players', result.players)
    setCsvImport({
      status: 'imported',
      fileName: file.name,
      count: result.players.length,
      skipped: result.skipped,
    })
  }

  const discard = () => {
    form.reset()
    setCsvImport(null)
  }

  return { form, savePlayers, csvImport, importCsv, discard }
}
