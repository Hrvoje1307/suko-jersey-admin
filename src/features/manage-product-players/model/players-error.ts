import { getValidationMessages, isApiError } from '@/shared/api'

export function getSavePlayersErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    if (!error.response) {
      return 'Server nije dostupan. Provjeri vezu i pokušaj ponovno.'
    }
    switch (error.response.status) {
      // Npr. igrača je u međuvremenu obrisao netko drugi.
      case 422: {
        const messages = getValidationMessages(error)
        return messages.length > 0
          ? `API je odbio igrače: ${messages.join(' ')}`
          : 'API je odbio igrače. Osvježi stranicu i pokušaj ponovno.'
      }
      case 404:
        return 'Proizvod više ne postoji — možda ga je netko obrisao.'
    }
  }
  return 'Spremanje igrača nije uspjelo. Pokušaj ponovno.'
}
