import { isApiError } from '@/shared/api'

export function getDeleteErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    if (!error.response) {
      return 'Server nije dostupan. Provjeri vezu i pokušaj ponovno.'
    }
    if (error.response.status === 404) {
      return 'Pošiljka je već obrisana.'
    }
  }
  return 'Brisanje nije uspjelo. Pokušaj ponovno.'
}
