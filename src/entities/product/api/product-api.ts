import { queryOptions, useMutation, useQuery, type UseMutationOptions } from '@tanstack/react-query'
import { apiClient } from '@/shared/api'
import { productSchema, type Product } from '../model/types'

export const productKeys = {
  all: ['products'] as const,
  adminList: () => [...productKeys.all, 'admin', 'list'] as const,
}

// Bez paginacije i filtera na serveru — sve to radi tablica na klijentu.
export async function getAdminProducts(): Promise<Product[]> {
  const { data } = await apiClient.get('/admin/products')
  return productSchema.array().parse(data)
}

// 409 kad je proizvod u narudžbama — poruka iz API-ja kaže što napraviti.
export async function deleteProduct(id: number): Promise<void> {
  await apiClient.delete(`/admin/products/${id}`)
}

export const adminProductsQueryOptions = queryOptions({
  queryKey: productKeys.adminList(),
  queryFn: getAdminProducts,
})

export function useAdminProducts() {
  return useQuery(adminProductsQueryOptions)
}

// Callbacke (toast, invalidacija) daje pozivatelj ovdje, a ne u mutate():
// gumb za brisanje nestaje s redom, a callbacki iz mutate() se na
// unmountanoj komponenti ne pozivaju.
export function useDeleteProduct(
  options: Omit<UseMutationOptions<void, Error, number>, 'mutationFn'> = {},
) {
  return useMutation({ ...options, mutationFn: deleteProduct })
}
