import { getValidationMessages, isApiError } from '@/shared/api'

export function getSaveErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    if (!error.response) {
      return 'Server nije dostupan. Provjeri vezu i pokušaj ponovno.'
    }
    switch (error.response.status) {
      // Najčešće narudžba koju je u međuvremenu netko stavio u drugu pošiljku
      // ili refundirao — API kaže koja (te poruke su na hrvatskom).
      case 422: {
        const messages = getValidationMessages(error)
        return messages.length > 0
          ? `API je odbio pošiljku: ${messages.join(' ')}`
          : 'API je odbio pošiljku. Provjeri podatke i pokušaj ponovno.'
      }
      case 404:
        return 'Pošiljka više ne postoji — možda ju je netko obrisao.'
    }
  }
  return 'Spremanje nije uspjelo. Pokušaj ponovno.'
}
