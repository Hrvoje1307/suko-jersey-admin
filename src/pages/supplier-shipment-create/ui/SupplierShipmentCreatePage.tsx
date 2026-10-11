import { Link } from '@tanstack/react-router'
import { ArrowLeftIcon } from 'lucide-react'
import { SupplierShipmentForm } from '@/features/supplier-shipment-form'

export function SupplierShipmentCreatePage() {
  return (
    <div className="grid max-w-4xl gap-6">
      <header className="grid gap-2">
        <Link
          to="/posiljke"
          className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" />
          Pošiljke
        </Link>
        <h1 className="text-2xl font-semibold">Nova pošiljka</h1>
        <p className="text-sm text-muted-foreground">
          Narudžbe možeš dodavati i kasnije, dok ih skupljaš — status mijenjaš na pošiljci kad
          naručiš kod dobavljača.
        </p>
      </header>
      <SupplierShipmentForm />
    </div>
  )
}
