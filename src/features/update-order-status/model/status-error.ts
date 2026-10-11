import { getValidationMessages, isApiError } from '@/shared/api'

export function getStatusErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    if (!error.response) {
      return 'Server nije dostupan. Provjeri vezu i pokušaj ponovno.'
    }
    switch (error.response.status) {
      case 422: {
        const messages = getValidationMessages(error)
        return messages.length > 0
          ? `API je odbio promjenu: ${messages.join(' ')}`
          : 'API je odbio promjenu statusa.'
      }
      case 404:
        return 'Narudžba više ne postoji.'
    }
  }
  return 'Spremanje statusa nije uspjelo. Pokušaj ponovno.'
}
