import { getValidationMessages, isApiError } from '@/shared/api'

export function getAdvanceErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    if (!error.response) {
      return 'Server nije dostupan. Provjeri vezu i pokušaj ponovno.'
    }
    switch (error.response.status) {
      case 422: {
        const messages = getValidationMessages(error)
        return messages.length > 0
          ? `API je odbio promjenu: ${messages.join(' ')}`
          : 'API je odbio promjenu statusa pošiljke.'
      }
      case 404:
        return 'Pošiljka više ne postoji — možda ju je netko obrisao.'
    }
  }
  return 'Promjena statusa nije uspjela. Pokušaj ponovno.'
}
