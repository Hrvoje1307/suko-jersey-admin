import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

// Pathless layout: sve rute ispod traže prijavu (ekvivalent ProtectedRoute wrappera).
export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context, location }) => {
    if (!context.getAuth().isAuthenticated) {
      throw redirect({ to: '/login', search: { redirect: location.href } })
    }
  },
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  return (
    <div className="flex min-h-svh">
      {/* AdminSidebar widget dolazi ovdje. */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  )
}
