import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { postLogout } from '@/entities/admin-user'
import { useAuth } from '@/shared/lib/auth'

export function useLogout() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { logout } = useAuth()

  return useMutation({
    // Opoziva token na serveru; mora ići prije logout(), jer interceptor
    // token čita iz localStorage.
    mutationFn: postLogout,
    // onSettled, ne onSuccess — lokalna odjava ide i kad API ne odgovori.
    onSettled: async () => {
      logout()
      await navigate({ to: '/login' })
      // Tek kad su stranice unmountane — inače bi aktivni upiti refetchali bez tokena.
      queryClient.clear()
    },
  })
}
