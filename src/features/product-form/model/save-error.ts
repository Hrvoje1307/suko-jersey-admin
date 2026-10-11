import { getValidationMessages, isApiError } from '@/shared/api'

export function getSaveErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    if (!error.response) {
      return 'Server nije dostupan. Provjeri vezu i pokušaj ponovno.'
    }
    switch (error.response.status) {
      // Forma validira isto što i API, pa je 422 rijedak — prikaži sve poruke.
      case 422: {
        const messages = getValidationMessages(error)
        return messages.length > 0
          ? `API je odbio podatke: ${messages.join(' ')}`
          : 'API je odbio podatke. Provjeri polja i pokušaj ponovno.'
      }
      case 404:
        return 'Proizvod više ne postoji — možda ga je netko obrisao.'
    }
  }
  return 'Spremanje nije uspjelo. Pokušaj ponovno.'
}
