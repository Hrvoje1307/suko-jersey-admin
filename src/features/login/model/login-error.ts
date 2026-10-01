import { isApiError } from '@/shared/api'

export function getLoginErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    if (!error.response) {
      return 'Server nije dostupan. Provjeri vezu i pokušaj ponovno.'
    }
    switch (error.response.status) {
      case 401:
        return 'Pogrešan email ili lozinka.'
      // API pušta 6 pokušaja prijave u minuti.
      case 429:
        return 'Previše pokušaja prijave. Pričekaj minutu pa pokušaj ponovno.'
    }
  }
  return 'Prijava nije uspjela. Pokušaj ponovno.'
}
