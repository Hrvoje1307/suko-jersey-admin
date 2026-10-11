// Jedna instanca po formatu — Intl konstruktori su skupi za svaki redak.
const currencyFormat = new Intl.NumberFormat('hr-HR', { style: 'currency', currency: 'EUR' })
const dateFormat = new Intl.DateTimeFormat('hr-HR', {
  day: 'numeric',
  month: 'numeric',
  year: 'numeric',
})
const dateTimeFormat = new Intl.DateTimeFormat('hr-HR', {
  day: 'numeric',
  month: 'numeric',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})
const regionNames = new Intl.DisplayNames(['hr'], { type: 'region' })

export function formatCurrency(value: number): string {
  return currencyFormat.format(value)
}

export function formatDate(iso: string): string {
  return dateFormat.format(new Date(iso))
}

export function formatDateTime(iso: string): string {
  return dateTimeFormat.format(new Date(iso))
}

// ISO 3166-1 alpha-2 → "Hrvatska"; nepoznat ili neispravan kod ostaje kakav jest.
export function formatCountry(code: string): string {
  try {
    return regionNames.of(code.toUpperCase()) ?? code
  } catch {
    return code
  }
}

// "sibenik" nađe "Šibenik"; đ se ne rastavlja pa ostaje kakav jest.
export function normalizeSearchText(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('hr')
}
