import { Link } from '@tanstack/react-router'
import { ChevronRightIcon, PackageCheckIcon, TruckIcon, type LucideIcon } from 'lucide-react'
import { useAdminOrders, type Order, type OrderStatus } from '@/entities/order'
import { cn, formatCount } from '@/shared/lib'
import { Card, CardContent, CardHeader, CardTitle, LoadError, Skeleton } from '@/shared/ui'

const ORDER_FORMS = { one: 'narudžba', few: 'narudžbe', other: 'narudžbi' }

type Task = {
  status: Extract<OrderStatus, 'ordered' | 'arrived_hr'>
  title: string
  icon: LucideIcon
}

const TASKS: Task[] = [
  { status: 'ordered', title: 'Naručiti kod dobavljača', icon: PackageCheckIcon },
  { status: 'arrived_hr', title: 'Poslati kupcu', icon: TruckIcon },
]

// Samo plaćene — link vodi na listu s istim filterom, pa se brojke poklapaju.
function countPaid(orders: Order[], status: OrderStatus): number {
  return orders.filter((order) => order.payment_status === 'paid' && order.status === status).length
}

// Dashboard endpoint ne vraća ove brojke, pa se broje iz liste narudžbi
// (isti upit i cache kao /narudzbe).
export function OrdersToProcess() {
  const { data: orders, error, isError, isFetching, refetch } = useAdminOrders()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Što treba napraviti</CardTitle>
      </CardHeader>
      <CardContent>
        {isError && !orders ? (
          <LoadError
            title="Narudžbe se nisu učitale"
            error={error}
            isRetrying={isFetching}
            onRetry={() => void refetch()}
          />
        ) : !orders ? (
          <div className="grid gap-2" aria-busy="true" aria-label="Učitavanje narudžbi">
            <Skeleton className="h-16 rounded-md" />
            <Skeleton className="h-16 rounded-md" />
          </div>
        ) : (
          <ul className="grid gap-2">
            {TASKS.map(({ status, title, icon: Icon }) => {
              const count = countPaid(orders, status)
              return (
                <li key={status}>
                  <Link
                    to="/narudzbe"
                    search={{ status, payment: 'paid' }}
                    className="flex items-center gap-4 rounded-md border px-4 py-3 transition-colors hover:bg-accent"
                  >
                    <Icon className="size-5 shrink-0 text-muted-foreground" />
                    <span className="grid flex-1">
                      <span className="font-medium">{title}</span>
                      <span className="text-sm text-muted-foreground">
                        {count === 0 ? 'Ništa ne čeka' : `${formatCount(count, ORDER_FORMS)} čeka`}
                      </span>
                    </span>
                    <span
                      className={cn(
                        'text-2xl font-semibold tabular-nums',
                        count === 0 && 'text-muted-foreground',
                      )}
                    >
                      {count}
                    </span>
                    <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
