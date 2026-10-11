import { AlertTriangleIcon, Loader2Icon, MailIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import {
  ORDER_STATUS_CUSTOMER_LABELS,
  ORDER_STATUS_LABELS,
  ORDER_STATUSES,
  TRACKING_VISIBLE_STATUSES,
  type OrderDetail,
  type OrderStatus,
  type PaymentStatus,
} from '@/entities/order'
import { cn } from '@/shared/lib'
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui'
import { useOrderStatusForm } from '../model/useOrderStatusForm'

type UpdateOrderStatusFormProps = {
  order: OrderDetail
}

export function UpdateOrderStatusForm({ order }: UpdateOrderStatusFormProps) {
  const { form, updateStatus, savedStatus } = useOrderStatusForm(order)

  return (
    <form
      noValidate
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <form.Field name="status">
        {(field) => (
          <div className="grid gap-2">
            <Label htmlFor="order-status">Status</Label>
            <Select
              value={field.state.value}
              onValueChange={(next) => {
                const status = ORDER_STATUSES.find((option) => option === next)
                if (status) field.handleChange(status)
              }}
            >
              <SelectTrigger id="order-status" className="w-full" aria-describedby="order-status-hint">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ORDER_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {ORDER_STATUS_LABELS[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p id="order-status-hint" className="text-sm text-muted-foreground">
              Kupac vidi: „{ORDER_STATUS_CUSTOMER_LABELS[field.state.value]}“
            </p>
          </div>
        )}
      </form.Field>

      <form.Field name="tracking_number_internal">
        {(field) => {
          const error = field.state.meta.errors[0]?.message
          return (
            <div className="grid gap-2">
              <Label htmlFor="order-tracking">Tracking broj</Label>
              <Input
                id="order-tracking"
                className="font-mono"
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
                onBlur={field.handleBlur}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? 'order-tracking-error' : 'order-tracking-hint'}
              />
              {error ? (
                <p id="order-tracking-error" className="text-sm text-destructive">
                  {error}
                </p>
              ) : (
                <p id="order-tracking-hint" className="text-sm text-muted-foreground">
                  Kupac ga vidi tek u statusu Poslano ili Dostavljeno.
                </p>
              )}
            </div>
          )
        }}
      </form.Field>

      <form.Subscribe selector={(state) => state.values}>
        {(values) => (
          <StatusChangeNotices
            savedStatus={savedStatus}
            status={values.status}
            hasTracking={values.tracking_number_internal.trim() !== ''}
            paymentStatus={order.payment_status}
          />
        )}
      </form.Subscribe>

      <form.Subscribe selector={(state) => [state.isDefaultValue, state.canSubmit] as const}>
        {([isDefaultValue, canSubmit]) => (
          <div className="flex flex-wrap justify-end gap-2">
            {!isDefaultValue && (
              <Button
                type="button"
                variant="outline"
                disabled={updateStatus.isPending}
                onClick={() => form.reset()}
              >
                Odustani
              </Button>
            )}
            <Button type="submit" disabled={isDefaultValue || !canSubmit || updateStatus.isPending}>
              {updateStatus.isPending && <Loader2Icon className="animate-spin" />}
              Spremi
            </Button>
          </div>
        )}
      </form.Subscribe>
    </form>
  )
}

type StatusChangeNoticesProps = {
  savedStatus: OrderStatus
  status: OrderStatus
  hasTracking: boolean
  paymentStatus: PaymentStatus
}

// API šalje email samo kad se status promijeni, i to sa stanjem u tom
// trenutku — tracking dodan naknadno kupac više ne dobiva.
function StatusChangeNotices({
  savedStatus,
  status,
  hasTracking,
  paymentStatus,
}: StatusChangeNoticesProps) {
  if (status === savedStatus) return null

  return (
    <div className="grid gap-2">
      <Notice icon={<MailIcon />}>Spremanjem kupac dobiva email o novom statusu.</Notice>
      {TRACKING_VISIBLE_STATUSES.includes(status) && !hasTracking && (
        <Notice icon={<AlertTriangleIcon />} tone="warning">
          Upiši tracking broj prije spremanja — ako ga dodaš kasnije, kupac ga neće dobiti emailom.
        </Notice>
      )}
      {(paymentStatus === 'unpaid' || paymentStatus === 'failed') && (
        <Notice icon={<AlertTriangleIcon />} tone="warning">
          Narudžba nije plaćena — email ide kupcu koji možda nije dovršio kupnju.
        </Notice>
      )}
      {paymentStatus === 'refunded' && (
        <Notice icon={<AlertTriangleIcon />} tone="warning">
          Narudžba je refundirana — kupac ipak dobiva email o novom statusu.
        </Notice>
      )}
    </div>
  )
}

type NoticeProps = {
  icon: ReactNode
  tone?: 'info' | 'warning'
  children: ReactNode
}

function Notice({ icon, tone = 'info', children }: NoticeProps) {
  return (
    <p
      className={cn(
        'flex gap-2 rounded-md px-3 py-2 text-sm [&>svg]:mt-0.5 [&>svg]:size-4 [&>svg]:shrink-0',
        tone === 'warning'
          ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200'
          : 'bg-muted text-muted-foreground',
      )}
    >
      {icon}
      <span>{children}</span>
    </p>
  )
}
