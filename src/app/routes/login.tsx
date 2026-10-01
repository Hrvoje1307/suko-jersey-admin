import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'
import { LoginPage } from '@/pages/login'

// Samo interne putanje — sprječava open redirect (npr. ?redirect=//evil.com).
const safeRedirect = z
  .string()
  .refine((v) => v.startsWith('/') && !v.startsWith('//'))
  .optional()
  .catch(undefined)

export const Route = createFileRoute('/login')({
  validateSearch: z.object({ redirect: safeRedirect }),
  beforeLoad: ({ context, search }) => {
    if (context.getAuth().isAuthenticated) {
      throw redirect({ href: search.redirect ?? '/' })
    }
  },
  component: LoginPage,
})
