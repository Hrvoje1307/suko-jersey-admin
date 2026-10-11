import { z } from 'zod'

export const PRODUCT_CATEGORIES = ['football', 'formula', 'basketball'] as const
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]

// Backend `type` je ciljana skupina (odrasli/djeca), ne vrsta dresa —
// domaći/gostujući API ne razlikuje.
export const PRODUCT_TYPES = ['adult', 'kids'] as const
export type ProductType = (typeof PRODUCT_TYPES)[number]

export const PRODUCT_STATUSES = ['active', 'draft', 'sold_out'] as const
export type ProductStatus = (typeof PRODUCT_STATUSES)[number]

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  football: 'Nogomet',
  formula: 'F1',
  basketball: 'Košarka',
}

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  adult: 'Odrasli',
  kids: 'Djeca',
}

export const STATUS_LABELS: Record<ProductStatus, string> = {
  active: 'Aktivan',
  draft: 'Skica',
  sold_out: 'Rasprodano',
}

// GET /admin/products vraća goli niz ProductDetail objekata. Lista treba samo
// polja iz ProductSummary — zod ostatak (opis, slike, igrači) odbacuje.
export const productSchema = z.object({
  id: z.number(),
  name: z.string(),
  club_or_team: z.string(),
  category: z.enum(PRODUCT_CATEGORIES),
  type: z.enum(PRODUCT_TYPES),
  // Nullable u bazi i requestu — proizvod može biti bez sezone.
  season: z.string().nullable(),
  price: z.number(),
  primary_image_url: z.string().nullable(),
  status: z.enum(PRODUCT_STATUSES),
  sizes: z.array(z.string()),
  created_at: z.string().nullable(),
})
export type Product = z.infer<typeof productSchema>

// `external_api` idući dohvat rostera briše i zamjenjuje; `manual` (dodao ili
// uredio admin) ostaje.
export const PLAYER_SOURCES = ['external_api', 'manual'] as const
export type PlayerSource = (typeof PLAYER_SOURCES)[number]

export const PLAYER_SOURCE_LABELS: Record<PlayerSource, string> = {
  external_api: 'API',
  manual: 'Ručno',
}

// Admin oblik igrača — vraćaju ga samo PUT /players i POST /fetch-players.
export const productPlayerSchema = z.object({
  id: z.number(),
  player_name: z.string(),
  player_number: z.string().nullable(),
  source: z.enum(PLAYER_SOURCES),
})
export type ProductPlayer = z.infer<typeof productPlayerSchema>

// GET /admin/products/{id}, a isti oblik vraćaju i POST i PUT.
// available_players je javni oblik igrača, bez `source`.
export const productDetailSchema = productSchema.extend({
  description: z.string().nullable(),
  model_3d_url: z.string().nullable(),
  images: z.array(z.string()),
  available_players: z.array(productPlayerSchema.omit({ source: true })),
})
export type ProductDetail = z.infer<typeof productDetailSchema>

// Ponuda u formi. API prima slobodan string (do 10 znakova), pa proizvod
// može imati i veličinu izvan ovih lista; slovne prate SIZE_ORDER backenda.
export const SIZE_PRESETS: Record<ProductType, readonly string[]> = {
  adult: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
  kids: ['116', '128', '140', '152', '164'],
}

export const PRODUCT_IMAGES_MAX = 20

const emptyToNull = (value: string) => value || null

// z.url, a ne z.httpUrl: httpUrl odbija localhost i IP adrese, a Laravelov
// `url` ih prima — proizvod s takvom slikom inače ne bi bilo moguće spremiti.
export const productUrlSchema = z
  .url({ protocol: /^https?$/, error: 'Unesi ispravan URL koji počinje s http:// ili https://.' })
  .max(500, 'URL može imati najviše 500 znakova.')

// Vrijednosti su ono što admin upisuje (cijena "89,99", prazan opis), a izlaz
// sheme je tijelo za POST/PUT. PUT je full replace, pa izlaz uvijek nosi sva
// polja — izostavljene slike, opis ili 3D model API bi obrisao.
export const productFormSchema = z.object({
  name: z.string().trim().min(1, 'Unesi naziv.').max(255, 'Naziv može imati najviše 255 znakova.'),
  club_or_team: z
    .string()
    .trim()
    .min(1, 'Unesi klub ili tim.')
    .max(255, 'Klub može imati najviše 255 znakova.'),
  category: z.enum(PRODUCT_CATEGORIES),
  type: z.enum(PRODUCT_TYPES),
  season: z.string().trim().max(50, 'Sezona može imati najviše 50 znakova.').transform(emptyToNull),
  price: z
    .string()
    .trim()
    .regex(/^\d{1,6}([.,]\d{1,2})?$/, 'Unesi cijenu u eurima, npr. 89,99.')
    .transform((value) => Number(value.replace(',', '.'))),
  description: z.string().trim().transform(emptyToNull),
  sizes: z
    .array(z.string())
    .min(1, 'Odaberi barem jednu veličinu.')
    .max(20, 'Proizvod može imati najviše 20 veličina.'),
  images: z
    .array(productUrlSchema)
    .max(PRODUCT_IMAGES_MAX, `Proizvod može imati najviše ${PRODUCT_IMAGES_MAX} slika.`),
  model_3d_url: z
    .string()
    .trim()
    .pipe(z.union([z.literal(''), productUrlSchema]))
    .transform(emptyToNull),
  status: z.enum(PRODUCT_STATUSES),
})
export type ProductFormValues = z.input<typeof productFormSchema>
export type ProductPayload = z.output<typeof productFormSchema>

// PUT /admin/products/{id}/players je full replace: igrač s `id` se ažurira,
// bez `id` dodaje, a izostavljeni se brišu.
export const productPlayersFormSchema = z.object({
  players: z.array(
    z
      .object({
        id: z.number().nullable(),
        player_name: z
          .string()
          .trim()
          .min(1, 'Unesi ime igrača.')
          .max(255, 'Ime može imati najviše 255 znakova.'),
        player_number: z.string().trim().max(10, 'Najviše 10 znakova.').transform(emptyToNull),
        // Samo za prikaz; null dok ga API ne vrati (detalj proizvoda ga nema).
        source: z.enum(PLAYER_SOURCES).nullable(),
      })
      // undefined id JSON izostavi — tako API zna da je igrač novi.
      .transform(({ id, player_name, player_number }) => ({
        id: id ?? undefined,
        player_name,
        player_number,
      })),
  ),
})
export type ProductPlayersFormValues = z.input<typeof productPlayersFormSchema>
export type ProductPlayerInput = z.output<typeof productPlayersFormSchema>['players'][number]
