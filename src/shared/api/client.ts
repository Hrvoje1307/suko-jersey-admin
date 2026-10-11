import axios, { AxiosError } from 'axios'
import { env } from '@/shared/config'
import { clearToken, getToken } from '@/shared/lib/auth'

export const apiClient = axios.create({
  baseURL: env.VITE_API_URL,
  // Bez Accept: application/json Laravel na neautoriziran zahtjev radi redirect umjesto 401.
  headers: { Accept: 'application/json' },
})

let onUnauthorized: (() => void) | null = null

/** app/ registrira što se događa na 401 (reset storea + redirect na /login). */
export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler
}

// 401 ovdje nije isteknuta sesija: na loginu je kriva lozinka, a na odjavi
// je token već mrtav — odjava ionako sama čisti store i ide na /login.
const AUTH_ENDPOINTS = ['/admin/login', '/admin/logout']

apiClient.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const url = error.config?.url ?? ''
    if (error.response?.status === 401 && !AUTH_ENDPOINTS.includes(url)) {
      clearToken()
      onUnauthorized?.()
    }
    return Promise.reject(error)
  },
)
