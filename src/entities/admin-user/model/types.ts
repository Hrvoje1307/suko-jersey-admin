import { z } from 'zod'

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

// GET /admin/me — puni auth store nakon logina i nakon refresha stranice.
export const adminUserSchema = z.object({
  id: z.number(),
  email: z.string(),
  name: z.string(),
})
export type AdminUser = z.infer<typeof adminUserSchema>
