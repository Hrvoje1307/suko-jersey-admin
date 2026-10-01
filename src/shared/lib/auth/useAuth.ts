import { useShallow } from 'zustand/react/shallow'
import { useAuthStore } from './auth-store'

export function useAuth() {
  return useAuthStore(
    useShallow((s) => ({
      isAuthenticated: s.isAuthenticated,
      token: s.token,
      admin: s.admin,
      login: s.login,
      logout: s.logout,
    })),
  )
}
