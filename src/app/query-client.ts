import { QueryClient } from '@tanstack/react-query'
import { isApiError } from '@/shared/api'

// Ove greške neće nestati ponovnim pokušajem.
const NO_RETRY_STATUSES = [401, 403, 404, 422]

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error) => {
        if (isApiError(error) && NO_RETRY_STATUSES.includes(error.response?.status ?? 0)) {
          return false
        }
        return failureCount < 2
      },
    },
  },
})
