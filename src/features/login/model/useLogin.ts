import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { getMe, postLogin, type LoginRequest } from '@/entities/admin-user'
import { clearToken, setToken, useAuth } from '@/shared/lib/auth'

type UseLoginOptions = {
  /** ?redirect= koji postavi _authenticated guard; bez njega ide na dashboard. */
  redirectTo?: string
}

export function useLogin({ redirectTo }: UseLoginOptions = {}) {
  const navigate = useNavigate()
  const { login } = useAuth()

  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const { token } = await postLogin(credentials)
      // getMe() šalje token preko interceptora, a on ga čita iz localStorage.
      setToken(token)
      try {
        return { token, admin: await getMe() }
      } catch (error) {
        clearToken()
        throw error
      }
    },
    onSuccess: ({ token, admin }) => {
      // Store mora biti prijavljen prije navigacije, inače guard vraća na /login.
      login(token, admin)
      // href, ne to — redirect je location.href i može nositi query string.
      void navigate({ href: redirectTo ?? '/', replace: true })
    },
  })
}
