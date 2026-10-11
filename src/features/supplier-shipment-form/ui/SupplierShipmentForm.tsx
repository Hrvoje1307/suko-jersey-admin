import { Link } from '@tanstack/react-router'
import { InfoIcon, Loader2Icon } from 'lucide-react'
import type { SupplierShipment } from '@/entities/supplier-shipment'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  FormField,
  Input,
  Textarea,
} from '@/shared/ui'
import { getSaveErrorMessage } from '../model/save-error'
import { useSupplierShipmentForm } from '../model/useSupplierShipmentForm'
import { ShipmentOrdersSection } from './ShipmentOrdersSection'

type SupplierShipmentFormProps = {
  /** Pošiljka koja se uređuje; bez nje forma kreira novu. */
  shipment?: SupplierShipment
}

export function SupplierShipmentForm({ shipment }: SupplierShipmentFormProps) {
  const { form, mutation } = useSupplierShipmentForm({ shipment })

  return (
    <form
      noValidate
      className="grid gap-6"
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <ShipmentOrdersSection form={form} savedOrders={shipment?.orders ?? []} />

      <Card>
        <CardHeader>
          <CardTitle>Podaci od dobavljača</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <form.Field name="supplier_reference">
            {(field) => (
              <FormField
                id="shipment-supplier-reference"
                label="Broj narudžbe kod dobavljača"
                error={field.state.meta.errors[0]?.message}
              >
                {(props) => (
                  <Input
                    {...props}
                    className="font-mono"
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                  />
                )}
              </FormField>
            )}
          </form.Field>

          <form.Field name="tracking_number">
            {(field) => (
              <FormField
                id="shipment-tracking"
                label="Tracking dobavljač → HR"
                error={field.state.meta.errors[0]?.message}
                hint="Samo za tebe — kupci ga ne vide."
              >
                {(props) => (
                  <Input
                    {...props}
                    className="font-mono"
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                  />
                )}
              </FormField>
            )}
          </form.Field>

          <form.Field name="note">
            {(field) => (
              <FormField
                id="shipment-note"
                label="Bilješka"
                error={field.state.meta.errors[0]?.message}
                className="sm:col-span-2"
              >
                {(props) => (
                  <Textarea
                    {...props}
                    rows={3}
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                  />
                )}
              </FormField>
            )}
          </form.Field>
        </CardContent>
      </Card>

      <p className="flex gap-2 rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground [&>svg]:mt-0.5 [&>svg]:size-4 [&>svg]:shrink-0">
        <InfoIcon />
        <span>
          Spremanje samo grupira narudžbe — statusi se ne mijenjaju i kupci ne dobivaju email. To
          radiš gumbom za idući korak pošiljke.
        </span>
      </p>

      {mutation.isError && (
        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {getSaveErrorMessage(mutation.error)}
        </p>
      )}

      <form.Subscribe selector={(state) => state.isDefaultValue}>
        {(isDefaultValue) => (
          <div className="flex flex-wrap justify-end gap-2">
            {shipment ? (
              !isDefaultValue && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={mutation.isPending}
                  onClick={() => form.reset()}
                >
                  Odbaci izmjene
                </Button>
              )
            ) : (
              <Button asChild variant="outline">
                <Link to="/posiljke">Odustani</Link>
              </Button>
            )}
            <Button
              type="submit"
              disabled={mutation.isPending || (shipment !== undefined && isDefaultValue)}
            >
              {mutation.isPending && <Loader2Icon className="animate-spin" />}
              {shipment ? 'Spremi izmjene' : 'Kreiraj pošiljku'}
            </Button>
          </div>
        )}
      </form.Subscribe>
    </form>
  )
}
