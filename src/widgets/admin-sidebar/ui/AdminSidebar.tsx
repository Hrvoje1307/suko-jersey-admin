import { Link } from '@tanstack/react-router'
import { LayoutDashboardIcon, LogOutIcon, PackageIcon, ReceiptTextIcon, ShirtIcon } from 'lucide-react'
import { useLogout } from '@/features/logout'
import { useAuth } from '@/shared/lib/auth'
import { Button } from '@/shared/ui'

// Dashboard je exact, inače bi '/' bio aktivan na svakoj ruti.
const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboardIcon, exact: true },
  { to: '/proizvodi', label: 'Proizvodi', icon: ShirtIcon, exact: false },
  { to: '/narudzbe', label: 'Narudžbe', icon: ReceiptTextIcon, exact: false },
  { to: '/posiljke', label: 'Pošiljke', icon: PackageIcon, exact: false },
] as const

export function AdminSidebar() {
  const { admin } = useAuth()
  const logout = useLogout()

  return (
    <aside className="sticky top-0 flex h-svh w-60 shrink-0 flex-col border-r bg-muted/40">
      <div className="px-6 py-5 text-lg font-semibold tracking-tight">Suko Jersey</div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {NAV_ITEMS.map(({ to, label, icon: Icon, exact }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact }}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground data-[status=active]:bg-accent data-[status=active]:font-medium data-[status=active]:text-accent-foreground"
          >
            <Icon className="size-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="grid gap-3 border-t p-3">
        {admin && (
          <div className="px-3">
            <p className="truncate text-sm font-medium">{admin.name}</p>
            <p className="truncate text-xs text-muted-foreground">{admin.email}</p>
          </div>
        )}
        <Button
          variant="outline"
          className="w-full"
          disabled={logout.isPending}
          onClick={() => logout.mutate()}
        >
          <LogOutIcon />
          {logout.isPending ? 'Odjava…' : 'Odjava'}
        </Button>
      </div>
    </aside>
  )
}
