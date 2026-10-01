import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/shared/lib/auth'

// Odjava je samo na klijentu: API nema /admin/logout, pa Sanctum token
// na serveru ostaje važeći dok ga se ne opozove.
export function useLogout() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { logout } = useAuth()

  return async () => {
    logout()
    await navigate({ to: '/login' })
    // Tek kad su stranice unmountane — inače bi aktivni upiti refetchali bez tokena.
    queryClient.clear()
  }
}
