import { getValidationMessages, isApiError } from '@/shared/api'

const SERVER_UNREACHABLE = 'Server nije dostupan. Provjeri vezu i pokušaj ponovno.'

export function getFetchPlayersErrorMessage(error: unknown): string {
  if (isApiError<{ message?: unknown }>(error)) {
    if (!error.response) {
      return SERVER_UNREACHABLE
    }
    const message = error.response.data?.message
    switch (error.response.status) {
      // 422: provider ne pokriva klub ili sezonu; 502: vanjski API nije
      // odgovorio. Poruka API-ja kaže zašto.
      case 422:
        return typeof message === 'string'
          ? message
          : 'Roster za ovaj klub ili sezonu nije dostupan. Dodaj igrače ručno.'
      case 502:
        return typeof message === 'string'
          ? message
          : 'Vanjski API nije odgovorio. Pokušaj ponovno kasnije.'
      // API pušta 10 dohvata u minuti (kvote vanjskih API-ja).
      case 429:
        return 'Previše dohvata. Pričekaj minutu pa pokušaj ponovno.'
      case 404:
        return 'Proizvod više ne postoji — možda ga je netko obrisao.'
    }
  }
  return 'Dohvat igrača nije uspio. Pokušaj ponovno.'
}

export function getSavePlayersErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    if (!error.response) {
      return SERVER_UNREACHABLE
    }
    switch (error.response.status) {
      // Npr. igrača je u međuvremenu obrisao dohvat rostera.
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
