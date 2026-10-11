import { queryOptions, useMutation, useQuery, type UseMutationOptions } from '@tanstack/react-query'
import { apiClient } from '@/shared/api'
import {
  productDetailSchema,
  productPlayerSchema,
  productSchema,
  type Product,
  type ProductDetail,
  type ProductPayload,
  type ProductPlayer,
  type ProductPlayerInput,
} from '../model/types'

export const productKeys = {
  all: ['products'] as const,
  adminList: () => [...productKeys.all, 'admin', 'list'] as const,
  adminDetail: (id: number) => [...productKeys.all, 'admin', 'detail', id] as const,
}

// Bez paginacije i filtera na serveru — sve to radi tablica na klijentu.
export async function getAdminProducts(): Promise<Product[]> {
  const { data } = await apiClient.get('/admin/products')
  return productSchema.array().parse(data)
}

export async function getAdminProduct(id: number): Promise<ProductDetail> {
  const { data } = await apiClient.get(`/admin/products/${id}`)
  return productDetailSchema.parse(data)
}

export async function createProduct(payload: ProductPayload): Promise<ProductDetail> {
  const { data } = await apiClient.post('/admin/products', payload)
  return productDetailSchema.parse(data)
}

export type UpdateProductVariables = { id: number; payload: ProductPayload }

export async function updateProduct({ id, payload }: UpdateProductVariables): Promise<ProductDetail> {
  const { data } = await apiClient.put(`/admin/products/${id}`, payload)
  return productDetailSchema.parse(data)
}

// 409 kad je proizvod u narudžbama — poruka iz API-ja kaže što napraviti.
export async function deleteProduct(id: number): Promise<void> {
  await apiClient.delete(`/admin/products/${id}`)
}

export type SavePlayersVariables = { productId: number; players: ProductPlayerInput[] }

export async function savePlayers({ productId, players }: SavePlayersVariables): Promise<ProductPlayer[]> {
  const { data } = await apiClient.put(`/admin/products/${productId}/players`, { players })
  return productPlayerSchema.array().parse(data)
}

export const adminProductsQueryOptions = queryOptions({
  queryKey: productKeys.adminList(),
  queryFn: getAdminProducts,
})

export const adminProductQueryOptions = (id: number) =>
  queryOptions({
    queryKey: productKeys.adminDetail(id),
    queryFn: () => getAdminProduct(id),
  })

export function useAdminProducts() {
  return useQuery(adminProductsQueryOptions)
}

export function useAdminProduct(id: number) {
  return useQuery(adminProductQueryOptions(id))
}

type MutationHookOptions<TData, TVariables> = Omit<
  UseMutationOptions<TData, Error, TVariables>,
  'mutationFn'
>

export function useCreateProduct(options: MutationHookOptions<ProductDetail, ProductPayload> = {}) {
  return useMutation({ ...options, mutationFn: createProduct })
}

export function useUpdateProduct(
  options: MutationHookOptions<ProductDetail, UpdateProductVariables> = {},
) {
  return useMutation({ ...options, mutationFn: updateProduct })
}

// Callbacke (toast, invalidacija) daje pozivatelj ovdje, a ne u mutate():
// gumb za brisanje nestaje s redom, a callbacki iz mutate() se na
// unmountanoj komponenti ne pozivaju.
export function useDeleteProduct(options: MutationHookOptions<void, number> = {}) {
  return useMutation({ ...options, mutationFn: deleteProduct })
}

export function useSavePlayers(
  options: MutationHookOptions<ProductPlayer[], SavePlayersVariables> = {},
) {
  return useMutation({ ...options, mutationFn: savePlayers })
}
