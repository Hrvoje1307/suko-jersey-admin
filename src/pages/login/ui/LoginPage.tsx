import { LoginForm } from '@/features/login'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui'

type LoginPageProps = {
  redirectTo?: string
}

export function LoginPage({ redirectTo }: LoginPageProps) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl tracking-tight">Suko Jersey</CardTitle>
          <CardDescription>Prijava u admin panel</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm redirectTo={redirectTo} />
        </CardContent>
      </Card>
    </main>
  )
}
