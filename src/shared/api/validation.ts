import { isAxiosError } from 'axios'

type ValidationErrorBody = {
  errors?: Record<string, unknown>
}

// Laravel 422: { message, errors: { polje: [poruke] } }. Poruke su s API-ja
// (engleski), pa ih forma prikazuje samo kad je njezina validacija propustila.
export function getValidationMessages(error: unknown): string[] {
  if (!isAxiosError<ValidationErrorBody>(error) || error.response?.status !== 422) {
    return []
  }
  return Object.values(error.response.data?.errors ?? {})
    .flat()
    .filter((message): message is string => typeof message === 'string')
}
