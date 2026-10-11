import { queryOptions, useMutation, useQuery, type UseMutationOptions } from '@tanstack/react-query'
import { apiClient } from '@/shared/api'
import {
  orderDetailSchema,
  orderSchema,
  type Order,
  type OrderDetail,
  type OrderStatusPayload,
} from '../model/types'

export const orderKeys = {
  all: ['orders'] as const,
  adminList: () => [...orderKeys.all, 'admin', 'list'] as const,
  adminDetail: (id: number) => [...orderKeys.all, 'admin', 'detail', id] as const,
}

// API vraća sve narudžbe bez paginacije, pa filtere i pretragu radi tablica
// na klijentu (?status= i ?payment_status= bi samo smanjili odgovor).
export async function getAdminOrders(): Promise<Order[]> {
  const { data } = await apiClient.get('/admin/orders')
  return orderSchema.array().parse(data)
}

export async function getAdminOrder(id: number): Promise<OrderDetail> {
  const { data } = await apiClient.get(`/admin/orders/${id}`)
  return orderDetailSchema.parse(data)
}

export type UpdateOrderStatusVariables = { id: number; payload: OrderStatusPayload }

// Promjena statusa (ne i samo trackinga) šalje kupcu email. Odgovor je kratki
// oblik narudžbe, bez adrese i trackinga.
export async function updateOrderStatus({ id, payload }: UpdateOrderStatusVariables): Promise<Order> {
  const { data } = await apiClient.put(`/admin/orders/${id}/status`, payload)
  return orderSchema.parse(data)
}

export const adminOrdersQueryOptions = queryOptions({
  queryKey: orderKeys.adminList(),
  queryFn: getAdminOrders,
})

export const adminOrderQueryOptions = (id: number) =>
  queryOptions({
    queryKey: orderKeys.adminDetail(id),
    queryFn: () => getAdminOrder(id),
  })

export function useAdminOrders() {
  return useQuery(adminOrdersQueryOptions)
}

export function useAdminOrder(id: number) {
  return useQuery(adminOrderQueryOptions(id))
}

export function useUpdateOrderStatus(
  options: Omit<UseMutationOptions<Order, Error, UpdateOrderStatusVariables>, 'mutationFn'> = {},
) {
  return useMutation({ ...options, mutationFn: updateOrderStatus })
}
