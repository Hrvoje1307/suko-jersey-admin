import { isApiError } from '@/shared/api'

export function getDeleteErrorMessage(error: unknown): string {
  if (isApiError<{ message?: unknown }>(error)) {
    if (!error.response) {
      return 'Server nije dostupan. Provjeri vezu i pokušaj ponovno.'
    }
    switch (error.response.status) {
      // Proizvod je u narudžbama — API u poruci kaže da se povuče statusom.
      case 409: {
        const message = error.response.data?.message
        return typeof message === 'string'
          ? message
          : 'Proizvod se nalazi u narudžbama i ne može se obrisati.'
      }
      case 404:
        return 'Proizvod je već obrisan.'
    }
  }
  return 'Brisanje nije uspjelo. Pokušaj ponovno.'
}
