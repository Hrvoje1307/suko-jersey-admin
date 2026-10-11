import { queryOptions, useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api'
import { dashboardSchema, type Dashboard } from '../model/types'

export const dashboardKeys = {
  all: ['dashboard'] as const,
}

export async function getDashboard(): Promise<Dashboard> {
  const { data } = await apiClient.get('/admin/dashboard')
  return dashboardSchema.parse(data)
}

export const dashboardQueryOptions = queryOptions({
  queryKey: dashboardKeys.all,
  queryFn: getDashboard,
})

// Kartice i top proizvodi dijele isti upit — jedan zahtjev.
export function useDashboard() {
  return useQuery(dashboardQueryOptions)
}
