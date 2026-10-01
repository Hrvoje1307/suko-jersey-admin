import { create } from 'zustand'
import { clearToken, getToken, setToken } from './token-storage'

/** Minimalni oblik prijavljenog admina; entities/admin-user ga proširuje. */
export type AuthAdmin = {
  name: string
  email: string
}

type AuthState = {
  token: string | null
  admin: AuthAdmin | null
  isAuthenticated: boolean
  login: (token: string, admin?: AuthAdmin | null) => void
  setAdmin: (admin: AuthAdmin | null) => void
  logout: () => void
}

// Na app load: postojeći token u localStorage = prijavljen.
const initialToken = getToken()

export const useAuthStore = create<AuthState>()((set) => ({
  token: initialToken,
  admin: null,
  isAuthenticated: initialToken !== null,
  login: (token, admin = null) => {
    setToken(token)
    set({ token, admin, isAuthenticated: true })
  },
  setAdmin: (admin) => set({ admin }),
  logout: () => {
    clearToken()
    set({ token: null, admin: null, isAuthenticated: false })
  },
}))
