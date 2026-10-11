import { queryOptions } from '@tanstack/react-query'
import { apiClient } from '@/shared/api'
import {
  adminUserSchema,
  loginResponseSchema,
  type AdminUser,
  type LoginRequest,
  type LoginResponse,
} from '../model/types'

// Putanja mora ostati točno '/admin/login' — po njoj interceptor 401 krive
// lozinke ne tretira kao isteklu sesiju (AUTH_ENDPOINTS u shared/api/client.ts).
export async function postLogin(credentials: LoginRequest): Promise<LoginResponse> {
  const { data } = await apiClient.post('/admin/login', credentials)
  return loginResponseSchema.parse(data)
}

// Kratki timeout jer klik na "Odjava" čeka ovaj zahtjev, a bez njega bi
// axios čekao neograničeno ako API visi.
export async function postLogout(): Promise<void> {
  await apiClient.post('/admin/logout', null, { timeout: 5_000 })
}

export async function getMe(): Promise<AdminUser> {
  const { data } = await apiClient.get('/admin/me')
  return adminUserSchema.parse(data)
}

export const meQueryOptions = queryOptions({
  queryKey: ['admin-user', 'me'],
  queryFn: getMe,
})
