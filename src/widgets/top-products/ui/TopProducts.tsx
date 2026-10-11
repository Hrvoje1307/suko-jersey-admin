import { useDashboard } from '@/entities/dashboard'
import { formatCount } from '@/shared/lib'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  LoadError,
  Skeleton,
} from '@/shared/ui'

const PIECE_FORMS = { one: 'komad', few: 'komada', other: 'komada' }

// Lista s trakama umjesto grafa: pet stavki s dugim nazivima čita se lakše.
export function TopProducts() {
  const { data, error, isError, isFetching, refetch } = useDashboard()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Najprodavaniji proizvodi</CardTitle>
        {/* Kartice iznad su za ovaj mjesec, ovo nije. */}
        <CardDescription>Ukupno, po prodanim komadima.</CardDescription>
      </CardHeader>
      <CardContent>
        {isError && !data ? (
          <LoadError
            title="Proizvodi se nisu učitali"
            error={error}
            isRetrying={isFetching}
            onRetry={() => void refetch()}
          />
        ) : !data ? (
          <div className="grid gap-4" aria-busy="true" aria-label="Učitavanje proizvoda">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="grid gap-1.5">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        ) : data.top_products.length === 0 ? (
          <p className="rounded-md border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
            Još nema prodanih proizvoda.
          </p>
        ) : (
          <ol className="grid gap-4">
            {data.top_products.map((product, index) => {
              // Lista je sortirana, pa je prvi najprodavaniji.
              const share = product.units_sold / data.top_products[0].units_sold
              return (
                <li key={product.product_name} className="grid gap-1.5">
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate">
                      <span className="mr-2 text-muted-foreground tabular-nums">{index + 1}.</span>
                      {product.product_name}
                    </span>
                    <span className="shrink-0 font-medium tabular-nums">
                      {formatCount(product.units_sold, PIECE_FORMS)}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted" aria-hidden="true">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${share * 100}%` }}
                    />
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  )
}
