import { CalendarIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { useDashboard } from '@/entities/dashboard'
import { ESTIMATED_PROFIT_MARGIN, MONTHLY_PROFIT_GOAL } from '@/shared/config'
import { formatCurrency, formatPercent } from '@/shared/lib'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  LoadError,
  Progress,
  Skeleton,
} from '@/shared/ui'

export function DashboardStats() {
  const { data, error, isError, isFetching, refetch } = useDashboard()

  // Greška u pozadinskom refetchu ne briše kartice koje su već prikazane.
  if (isError && !data) {
    return (
      <LoadError
        title="Statistika se nije učitala"
        error={error}
        isRetrying={isFetching}
        onRetry={() => void refetch()}
      />
    )
  }

  if (!data) {
    return <StatsSkeleton />
  }

  if (data.total_orders_this_month === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-dashed px-6 py-12 text-center">
        <CalendarIcon className="size-10 text-muted-foreground" />
        <div>
          <p className="font-medium">Još nema narudžbi ovaj mjesec</p>
          <p className="text-sm text-muted-foreground">
            Cilj zarade za mjesec: {formatCurrency(MONTHLY_PROFIT_GOAL)}
          </p>
        </div>
      </div>
    )
  }

  // API zna samo prihod — zarada je procjena po fiksnoj marži.
  const estimatedProfit = data.revenue_this_month * ESTIMATED_PROFIT_MARGIN
  const goalRatio = estimatedProfit / MONTHLY_PROFIT_GOAL
  const revenueToGoal = Math.max(0, MONTHLY_PROFIT_GOAL - estimatedProfit) / ESTIMATED_PROFIT_MARGIN

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatCard
        title="Narudžbe ovaj mjesec"
        value={data.total_orders_this_month}
        hint="Sve zaprimljene, i one s nedovršenim plaćanjem."
      />
      <StatCard
        title="Prihod ovaj mjesec"
        value={formatCurrency(data.revenue_this_month)}
        hint="Samo plaćene narudžbe."
      />
      <StatCard
        title="Zarada prema cilju"
        value={formatPercent(goalRatio)}
        hint={`Procjena: ${formatPercent(ESTIMATED_PROFIT_MARGIN)} prihoda ostaje nakon svih troškova.`}
      >
        {/* Postotak smije prijeći 100 %, traka ne. */}
        <Progress
          value={Math.min(goalRatio, 1) * 100}
          aria-label="Procijenjena zarada prema mjesečnom cilju"
        />
        <p className="text-sm tabular-nums">
          ≈ {formatCurrency(estimatedProfit)} od {formatCurrency(MONTHLY_PROFIT_GOAL)}
        </p>
        {revenueToGoal > 0 && (
          <p className="text-sm text-muted-foreground tabular-nums">
            Do cilja još ≈ {formatCurrency(revenueToGoal)} prihoda.
          </p>
        )}
      </StatCard>
    </div>
  )
}

type StatCardProps = {
  title: string
  value: ReactNode
  hint: string
  children?: ReactNode
}

function StatCard({ title, value, hint, children }: StatCardProps) {
  return (
    <Card className="gap-4">
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-3xl font-semibold tabular-nums">{value}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        {children}
        <p className="text-sm text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  )
}

function StatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-3" aria-busy="true" aria-label="Učitavanje statistike">
      {Array.from({ length: 3 }, (_, index) => (
        <Skeleton key={index} className="h-36 rounded-xl" />
      ))}
    </div>
  )
}
