import { productPlayerRowSchema, type ProductPlayerRow } from '@/entities/product'
import { parseCsv } from '@/shared/lib'

// Točka-zarez jer ga hrvatski Excel prepoznaje kao razdjelnik; BOM da Excel
// datoteku otvori kao UTF-8 (inače ć/č postanu smeće).
export const PLAYERS_CSV_TEMPLATE = '﻿ime;broj\nLuka Modrić;10\nIvan Perišić;\n'

const NAME_HEADERS = ['ime', 'igrac', 'ime i prezime', 'name', 'player', 'player_name']
const NUMBER_HEADERS = ['broj', 'br', '#', 'number', 'no', 'nr', 'player_number']

export type PlayersCsvResult =
  | { ok: true; players: ProductPlayerRow[]; skipped: string[] }
  | { ok: false; error: string }

function normalizeHeader(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').trim().toLowerCase()
}

export function parsePlayersCsv(text: string): PlayersCsvResult {
  // Broj reda kakav admin vidi u Excelu, prije izbacivanja praznih redova.
  const rows = parseCsv(text)
    .map((cells, index) => ({ cells: cells.map((cell) => cell.trim()), line: index + 1 }))
    .filter(({ cells }) => cells.some(Boolean))

  if (rows.length === 0) {
    return { ok: false, error: 'Datoteka je prazna.' }
  }

  const header = rows[0].cells.map(normalizeHeader)
  let nameColumn = header.findIndex((cell) => NAME_HEADERS.includes(cell))
  let numberColumn = header.findIndex((cell) => NUMBER_HEADERS.includes(cell))
  const hasHeader = nameColumn !== -1 || numberColumn !== -1

  if (hasHeader && nameColumn === -1) {
    return { ok: false, error: 'CSV nema stupac "ime".' }
  }

  const body = hasHeader ? rows.slice(1) : rows

  // Bez zaglavlja: jedan stupac su imena, a kod dva je broj prvi ako prvi
  // stupac sadrži samo brojeve.
  if (!hasHeader) {
    const hasTwoColumns = body.some(({ cells }) => cells.length > 1)
    const numberFirst = hasTwoColumns && body.every(({ cells }) => /^\d*$/.test(cells[0] ?? ''))
    nameColumn = numberFirst ? 1 : 0
    numberColumn = hasTwoColumns ? (numberFirst ? 0 : 1) : -1
  }

  const players: ProductPlayerRow[] = []
  const skipped: string[] = []

  for (const { cells, line } of body) {
    const row: ProductPlayerRow = {
      id: null,
      player_name: cells[nameColumn] ?? '',
      player_number: numberColumn === -1 ? '' : (cells[numberColumn] ?? ''),
    }
    const result = productPlayerRowSchema.safeParse(row)
    if (result.success) {
      players.push(row)
    } else {
      skipped.push(`Red ${line}: ${result.error.issues[0]?.message ?? 'neispravan red.'}`)
    }
  }

  if (players.length === 0) {
    return {
      ok: false,
      error: skipped.length > 0 ? `Nijedan red nije ispravan. ${skipped[0]}` : 'U datoteci nema igrača.',
    }
  }

  return { ok: true, players, skipped }
}
