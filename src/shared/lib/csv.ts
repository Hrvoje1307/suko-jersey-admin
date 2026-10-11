// RFC 4180 (navodnici, "" unutar navodnika, CRLF) uz prepoznavanje
// razdjelnika: Excel s hrvatskim postavkama sprema CSV s točkom-zarezom.
export function parseCsv(text: string): string[][] {
  const input = text.replace(/^﻿/, '')
  const delimiter = detectDelimiter(input)
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < input.length; i++) {
    const char = input[i]
    if (inQuotes) {
      if (char !== '"') {
        field += char
      } else if (input[i + 1] === '"') {
        field += '"'
        i++
      } else {
        inQuotes = false
      }
    } else if (char === '"') {
      inQuotes = true
    } else if (char === delimiter) {
      row.push(field)
      field = ''
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && input[i + 1] === '\n') i++
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else {
      field += char
    }
  }
  // Zadnji red bez završnog prijeloma.
  if (field !== '' || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

// Najčešći kandidat u prvom redu; datoteka s jednim stupcem nema nijednog.
function detectDelimiter(text: string): string {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? ''
  let best = ','
  let bestCount = 0
  for (const candidate of [';', ',', '\t']) {
    const count = firstLine.split(candidate).length - 1
    if (count > bestCount) {
      best = candidate
      bestCount = count
    }
  }
  return best
}

// Excel na Windowsima CSV često sprema u Windows-1250, pa bi č/ć/š/ž bez
// ovog fallbacka postali "�".
export async function readTextFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(buffer)
  } catch {
    return new TextDecoder('windows-1250').decode(buffer)
  }
}

export function downloadTextFile(fileName: string, content: string, type = 'text/csv') {
  const url = URL.createObjectURL(new Blob([content], { type: `${type};charset=utf-8` }))
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  // Tek kad preglednik pokrene preuzimanje.
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
