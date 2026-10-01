import { revalidateLogic, useForm } from '@tanstack/react-form'
import { Loader2Icon } from 'lucide-react'
import { loginRequestSchema, type LoginRequest } from '@/entities/admin-user'
import { Button, Input } from '@/shared/ui'
import { getLoginErrorMessage } from '../model/login-error'
import { useLogin } from '../model/useLogin'

const defaultValues: LoginRequest = { email: '', password: '' }

type LoginFormProps = {
  redirectTo?: string
}

export function LoginForm({ redirectTo }: LoginFormProps) {
  const login = useLogin({ redirectTo })

  const form = useForm({
    defaultValues,
    // Greške tek nakon prvog slanja, a onda se ažuriraju dok se tipka.
    validationLogic: revalidateLogic({ mode: 'submit', modeAfterSubmission: 'change' }),
    validators: { onDynamic: loginRequestSchema },
    onSubmit: ({ value }) => login.mutate(value),
  })

  return (
    <form
      noValidate
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <form.Field name="email">
        {(field) => {
          const error = field.state.meta.errors[0]?.message
          return (
            <div className="grid gap-2">
              <label htmlFor="login-email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                autoFocus
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
                onBlur={field.handleBlur}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? 'login-email-error' : undefined}
              />
              {error && <FieldError id="login-email-error">{error}</FieldError>}
            </div>
          )
        }}
      </form.Field>

      <form.Field name="password">
        {(field) => {
          const error = field.state.meta.errors[0]?.message
          return (
            <div className="grid gap-2">
              <label htmlFor="login-password" className="text-sm font-medium">
                Lozinka
              </label>
              <Input
                id="login-password"
                type="password"
                autoComplete="current-password"
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
                onBlur={field.handleBlur}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? 'login-password-error' : undefined}
              />
              {error && <FieldError id="login-password-error">{error}</FieldError>}
            </div>
          )
        }}
      </form.Field>

      {login.isError && (
        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {getLoginErrorMessage(login.error)}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={login.isPending}>
        {login.isPending && <Loader2Icon className="animate-spin" />}
        {login.isPending ? 'Prijava…' : 'Prijavi se'}
      </Button>
    </form>
  )
}

function FieldError({ id, children }: { id: string; children: string }) {
  return (
    <p id={id} className="text-sm text-destructive">
      {children}
    </p>
  )
}
