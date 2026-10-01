import { createRouter } from '@tanstack/react-router'
import { setUnauthorizedHandler } from '@/shared/api'
import { useAuthStore } from '@/shared/lib/auth'
import { queryClient } from './query-client'
import { routeTree } from './routeTree.gen'

export const router = createRouter({
  routeTree,
  context: {
    queryClient,
    // Funkcija, ne snapshot — beforeLoad uvijek čita svježe stanje.
    getAuth: useAuthStore.getState,
  },
  defaultPreload: 'intent',
  scrollRestoration: true,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// 401 s API-ja: token je već obrisan u interceptoru, ovdje resetiramo stanje i šaljemo na login.
setUnauthorizedHandler(() => {
  useAuthStore.getState().logout()
  queryClient.clear()
  const { pathname } = router.state.location
  if (pathname !== '/login') {
    router.navigate({ to: '/login', search: { redirect: router.state.location.href } })
  }
})
