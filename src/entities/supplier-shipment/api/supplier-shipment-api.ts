import { queryOptions, useMutation, useQuery, type UseMutationOptions } from '@tanstack/react-query'
import { apiClient } from '@/shared/api'
import {
  supplierShipmentSchema,
  type ShipmentStep,
  type SupplierShipment,
  type SupplierShipmentPayload,
} from '../model/types'

export const supplierShipmentKeys = {
  all: ['supplier-shipments'] as const,
  list: () => [...supplierShipmentKeys.all, 'list'] as const,
  detail: (id: number) => [...supplierShipmentKeys.all, 'detail', id] as const,
}

// Goli niz, najnovija prva, bez paginacije.
export async function getSupplierShipments(): Promise<SupplierShipment[]> {
  const { data } = await apiClient.get('/admin/supplier-shipments')
  return supplierShipmentSchema.array().parse(data)
}

export async function getSupplierShipment(id: number): Promise<SupplierShipment> {
  const { data } = await apiClient.get(`/admin/supplier-shipments/${id}`)
  return supplierShipmentSchema.parse(data)
}

// Kreiranje i izmjena samo grupiraju narudžbe — statusi i emailovi se ne diraju.
export async function createSupplierShipment(payload: SupplierShipmentPayload): Promise<SupplierShipment> {
  const { data } = await apiClient.post('/admin/supplier-shipments', payload)
  return supplierShipmentSchema.parse(data)
}

export type UpdateSupplierShipmentVariables = { id: number; payload: SupplierShipmentPayload }

export async function updateSupplierShipment({
  id,
  payload,
}: UpdateSupplierShipmentVariables): Promise<SupplierShipment> {
  const { data } = await apiClient.put(`/admin/supplier-shipments/${id}`, payload)
  return supplierShipmentSchema.parse(data)
}

export type AdvanceSupplierShipmentVariables = { id: number; status: ShipmentStep }

// Pomiče plaćene narudžbe koje su prije koraka; svaka pomaknuta šalje email kupcu.
export async function advanceSupplierShipment({
  id,
  status,
}: AdvanceSupplierShipmentVariables): Promise<SupplierShipment> {
  const { data } = await apiClient.put(`/admin/supplier-shipments/${id}/status`, { status })
  return supplierShipmentSchema.parse(data)
}

// Narudžbe ostaju sa svojim statusom, samo izlaze iz pošiljke.
export async function deleteSupplierShipment(id: number): Promise<void> {
  await apiClient.delete(`/admin/supplier-shipments/${id}`)
}

export const supplierShipmentsQueryOptions = queryOptions({
  queryKey: supplierShipmentKeys.list(),
  queryFn: getSupplierShipments,
})

export const supplierShipmentQueryOptions = (id: number) =>
  queryOptions({
    queryKey: supplierShipmentKeys.detail(id),
    queryFn: () => getSupplierShipment(id),
  })

export function useSupplierShipments() {
  return useQuery(supplierShipmentsQueryOptions)
}

export function useSupplierShipment(id: number) {
  return useQuery(supplierShipmentQueryOptions(id))
}

type MutationHookOptions<TData, TVariables> = Omit<
  UseMutationOptions<TData, Error, TVariables>,
  'mutationFn'
>

export function useCreateSupplierShipment(
  options: MutationHookOptions<SupplierShipment, SupplierShipmentPayload> = {},
) {
  return useMutation({ ...options, mutationFn: createSupplierShipment })
}

export function useUpdateSupplierShipment(
  options: MutationHookOptions<SupplierShipment, UpdateSupplierShipmentVariables> = {},
) {
  return useMutation({ ...options, mutationFn: updateSupplierShipment })
}

export function useAdvanceSupplierShipment(
  options: MutationHookOptions<SupplierShipment, AdvanceSupplierShipmentVariables> = {},
) {
  return useMutation({ ...options, mutationFn: advanceSupplierShipment })
}

export function useDeleteSupplierShipment(options: MutationHookOptions<void, number> = {}) {
  return useMutation({ ...options, mutationFn: deleteSupplierShipment })
}
