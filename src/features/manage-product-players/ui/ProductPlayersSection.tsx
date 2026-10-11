import { DownloadIcon, Loader2Icon, PlusIcon, XIcon } from 'lucide-react'
import { CATEGORY_LABELS, PLAYER_SOURCE_LABELS, type ProductDetail } from '@/entities/product'
import {
  Badge,
  Button,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from '@/shared/ui'
import { getFetchPlayersErrorMessage } from '../model/players-error'
import { useProductPlayersForm } from '../model/useProductPlayersForm'

type ProductPlayersSectionProps = {
  /** Spremljeni proizvod — dohvat rostera čita kategoriju, klub i sezonu iz baze. */
  product: ProductDetail
}

export function ProductPlayersSection({ product }: ProductPlayersSectionProps) {
  const { form, fetchPlayers, savePlayers } = useProductPlayersForm(product)
  const isBusy = fetchPlayers.isPending || savePlayers.isPending

  return (
    <Card>
      <CardHeader>
        <CardTitle>Igrači za tisak</CardTitle>
        <CardDescription>
          Ponuda imena i brojeva za tisak na dresu. Kupac uvijek može upisati i vlastiti tekst.
        </CardDescription>
        <CardAction>
          <form.Subscribe selector={(state) => state.isDirty}>
            {(isDirty) => (
              <Button
                type="button"
                variant="outline"
                // Dohvat zamjenjuje listu, pa bi nespremljene izmjene nestale.
                disabled={isDirty || isBusy}
                title={isDirty ? 'Spremi ili odbaci izmjene igrača prije dohvata.' : undefined}
                onClick={() => fetchPlayers.mutate(product.id)}
              >
                {fetchPlayers.isPending ? <Loader2Icon className="animate-spin" /> : <DownloadIcon />}
                Dohvati roster
              </Button>
            )}
          </form.Subscribe>
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
          <p className="text-sm text-muted-foreground">
            Dohvat koristi spremljene podatke: {CATEGORY_LABELS[product.category]} ·{' '}
            {product.club_or_team} · {product.season ?? 'bez sezone'}. Zamjenjuje prethodno
            dohvaćene igrače, a ručno dodani i uređeni ostaju.
          </p>

          {fetchPlayers.isError && (
            <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {getFetchPlayersErrorMessage(fetchPlayers.error)}
            </p>
          )}

          <form.Field name="players" mode="array">
            {(field) => (
              <div className="grid gap-3">
                {field.state.value.length > 0 ? (
                  <ul className="grid gap-2">
                    <li
                      aria-hidden
                      className="grid grid-cols-[5rem_1fr_4rem_2rem] gap-2 text-sm font-medium text-muted-foreground"
                    >
                      <span>Broj</span>
                      <span>Ime</span>
                    </li>
                    {field.state.value.map((player, index) => (
                      <li key={index} className="grid grid-cols-[5rem_1fr_4rem_2rem] items-start gap-2">
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
                                // Novi red dobiva fokus čim se doda.
                                autoFocus={player.id === null}
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
                        <div className="flex h-9 items-center">
                          {player.id === null ? (
                            <Badge variant="outline">Novi</Badge>
                          ) : (
                            player.source && (
                              <Badge variant={player.source === 'manual' ? 'outline' : 'secondary'}>
                                {PLAYER_SOURCE_LABELS[player.source]}
                              </Badge>
                            )
                          )}
                        </div>
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
                    Još nema igrača. Dohvati roster ili dodaj igrače ručno.
                  </p>
                )}
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      field.pushValue({ id: null, player_name: '', player_number: '', source: null })
                    }
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
                    onClick={() => form.reset()}
                  >
                    Odbaci izmjene
                  </Button>
                  <Button type="submit" disabled={isBusy}>
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
