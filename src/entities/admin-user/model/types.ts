import { z } from 'zod'
import type { AuthAdmin } from '@/shared/lib/auth'

export const loginRequestSchema = z.object({
  email: z.email('Unesi ispravan email.'),
  password: z.string().min(1, 'Unesi lozinku.'),
})
export type LoginRequest = z.infer<typeof loginRequestSchema>

// POST /admin/login vraća samo token (vidi suko-jersey-api AdminAuthController).
export const loginResponseSchema = z.object({
  token: z.string().min(1),
})
export type LoginResponse = z.infer<typeof loginResponseSchema>

// Puni se tek kad API dobije GET /admin/me.
export type AdminUser = AuthAdmin & {
  id: number
}
