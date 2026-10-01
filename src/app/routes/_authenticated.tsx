import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { meQueryOptions } from '@/entities/admin-user'
import { isApiError } from '@/shared/api'
import { AdminSidebar } from '@/widgets/admin-sidebar'

// Pathless layout: sve rute ispod traže prijavu (ekvivalent ProtectedRoute wrappera).
export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ context, location }) => {
    const auth = context.getAuth()
    if (!auth.isAuthenticated) {
      throw redirect({ to: '/login', search: { redirect: location.href } })
    }

    // Nakon refresha store ima token iz localStorage, ali ne i admina — bez
    // ovoga bi ime u sidebaru nestalo. Usput provjerava je li token još živ.
    if (!auth.admin) {
      try {
        auth.setAdmin(await context.queryClient.ensureQueryData(meQueryOptions))
      } catch (error) {
        // Token i store je na 401 već počistio interceptor; ostale greške
        // (mreža, 5xx) ne odjavljuju.
        if (isApiError(error) && error.response?.status === 401) {
          throw redirect({ to: '/login', search: { redirect: location.href } })
        }
        throw error
      }
    }
  },
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  return (
    <div className="flex min-h-svh">
      <AdminSidebar />
      <main className="min-w-0 flex-1 p-6">
        <Outlet />
      </main>
    </div>
  )
}
