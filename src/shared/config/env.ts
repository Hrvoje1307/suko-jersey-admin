import { z } from 'zod'

const envSchema = z.object({
  VITE_API_URL: z.url(),
})

const parsed = envSchema.safeParse(import.meta.env)

if (!parsed.success) {
  throw new Error(
    `Neispravne env varijable (provjeri .env):\n${z.prettifyError(parsed.error)}`,
  )
}

export const env = parsed.data
