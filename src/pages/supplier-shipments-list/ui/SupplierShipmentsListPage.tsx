import { Link } from '@tanstack/react-router'
import { PlusIcon } from 'lucide-react'
import { Button } from '@/shared/ui'
import { SupplierShipmentsTable } from '@/widgets/supplier-shipments-table'

export function SupplierShipmentsListPage() {
  return (
    <div className="grid gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Pošiljke</h1>
          <p className="text-sm text-muted-foreground">
            Narudžbe naručene zajedno kod dobavljača putuju skupa do Hrvatske.
          </p>
        </div>
        <Button asChild>
          <Link to="/posiljke/nova">
            <PlusIcon />
            Nova pošiljka
          </Link>
        </Button>
      </header>
      <SupplierShipmentsTable />
    </div>
  )
}
