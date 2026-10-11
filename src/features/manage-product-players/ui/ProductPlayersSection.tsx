import { DownloadIcon, Loader2Icon, PlusIcon, UploadIcon, XIcon } from 'lucide-react'
import { useRef } from 'react'
import type { ProductDetail } from '@/entities/product'
import { downloadTextFile } from '@/shared/lib'
import {
  Button,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from '@/shared/ui'
import { PLAYERS_CSV_TEMPLATE } from '../model/players-csv'
import { useProductPlayersForm, type CsvImportState } from '../model/useProductPlayersForm'

type ProductPlayersSectionProps = {
  product: ProductDetail
}

export function ProductPlayersSection({ product }: ProductPlayersSectionProps) {
  const { form, savePlayers, csvImport, importCsv, discard } = useProductPlayersForm(product)
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Igrači za tisak</CardTitle>
        <CardDescription>
          Ponuda imena i brojeva za tisak na dresu. Kupac uvijek može upisati i vlastiti tekst.
        </CardDescription>
        <CardAction>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0]
              // Reset, da ponovni odabir iste datoteke opet okine onChange.
              event.target.value = ''
              if (file) void importCsv(file)
            }}
          />
          <Button
            type="button"
            variant="outline"
            disabled={savePlayers.isPending}
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadIcon />
            Uvezi CSV
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent>
        <form
          noValidate
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault()
            void form.handleSubmit()
          }}
        >
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            <span>
              CSV sa stupcima <code>ime</code> i <code>broj</code> (broj nije obavezan). Uvoz
              zamjenjuje listu ispod — pregledaj je pa spremi.
            </span>
            <Button
              type="button"
              variant="link"
              size="sm"
              className="h-auto p-0"
              onClick={() => downloadTextFile('igraci-predlozak.csv', PLAYERS_CSV_TEMPLATE)}
            >
              <DownloadIcon />
              Preuzmi predložak
            </Button>
          </div>

          {csvImport && <CsvImportNotice state={csvImport} />}

          <form.Field name="players" mode="array">
            {(field) => (
              <div className="grid gap-3">
                {field.state.value.length > 0 ? (
                  <ul className="grid gap-2">
                    <li
                      aria-hidden
                      className="grid grid-cols-[5rem_1fr_2rem] gap-2 text-sm font-medium text-muted-foreground"
                    >
                      <span>Broj</span>
                      <span>Ime</span>
                    </li>
                    {field.state.value.map((player, index) => (
                      <li key={index} className="grid grid-cols-[5rem_1fr_2rem] items-start gap-2">
                        <form.Field name={`players[${index}].player_number`}>
                          {(numberField) => (
                            <div className="grid gap-1">
                              <Input
                                aria-label={`Broj igrača ${index + 1}`}
                                inputMode="numeric"
                                className="tabular-nums"
                                value={numberField.state.value}
                                onChange={(event) => numberField.handleChange(event.target.value)}
                                onBlur={numberField.handleBlur}
                                aria-invalid={numberField.state.meta.errors[0] ? true : undefined}
                              />
                              {numberField.state.meta.errors[0] && (
                                <p className="text-sm text-destructive">
                                  {numberField.state.meta.errors[0].message}
                                </p>
                              )}
                            </div>
                          )}
                        </form.Field>
                        <form.Field name={`players[${index}].player_name`}>
                          {(nameField) => (
                            <div className="grid gap-1">
                              <Input
                                aria-label={`Ime igrača ${index + 1}`}
                                // Ručno dodan red dobiva fokus čim se pojavi.
                                autoFocus={player.id === null && player.player_name === ''}
                                value={nameField.state.value}
                                onChange={(event) => nameField.handleChange(event.target.value)}
                                onBlur={nameField.handleBlur}
                                aria-invalid={nameField.state.meta.errors[0] ? true : undefined}
                              />
                              {nameField.state.meta.errors[0] && (
                                <p className="text-sm text-destructive">
                                  {nameField.state.meta.errors[0].message}
                                </p>
                              )}
                            </div>
                          )}
                        </form.Field>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="mt-0.5 text-destructive hover:text-destructive"
                          aria-label={`Ukloni igrača ${index + 1}`}
                          onClick={() => field.removeValue(index)}
                        >
                          <XIcon />
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="rounded-md border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                    Još nema igrača. Uvezi CSV ili ih dodaj ručno.
                  </p>
                )}
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => field.pushValue({ id: null, player_name: '', player_number: '' })}
                  >
                    <PlusIcon />
                    Dodaj igrača
                  </Button>
                </div>
              </div>
            )}
          </form.Field>

          <form.Subscribe selector={(state) => state.isDirty}>
            {(isDirty) =>
              isDirty && (
                <div className="flex flex-wrap justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={savePlayers.isPending}
                    onClick={discard}
                  >
                    Odbaci izmjene
                  </Button>
                  <Button type="submit" disabled={savePlayers.isPending}>
                    {savePlayers.isPending && <Loader2Icon className="animate-spin" />}
                    Spremi igrače
                  </Button>
                </div>
              )
            }
          </form.Subscribe>
        </form>
      </CardContent>
    </Card>
  )
}

const SKIPPED_SHOWN = 5

function CsvImportNotice({ state }: { state: CsvImportState }) {
  if (state.status === 'error') {
    return (
      <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
        {state.fileName}: {state.error}
      </p>
    )
  }

  const hidden = state.skipped.length - SKIPPED_SHOWN
  return (
    <div role="status" className="grid gap-1 rounded-md bg-muted px-3 py-2 text-sm">
      <p>
        Iz datoteke {state.fileName} učitano je igrača: {state.count}. Pregledaj listu pa spremi.
      </p>
      {state.skipped.length > 0 && (
        <div className="text-muted-foreground">
          <p>Preskočeni redovi:</p>
          <ul className="list-disc pl-5">
            {state.skipped.slice(0, SKIPPED_SHOWN).map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
          {hidden > 0 && <p>…i još {hidden}.</p>}
        </div>
      )}
    </div>
  )
}
