import { createPaginatedRowModel, rowPaginationFeature, tableFeatures } from '@tanstack/react-table'

// Filteri idu prije tablice (vidi filterOrders), a redoslijed daje API
// (najnovije prvo), pa tablici treba samo paginacija.
export const orderTableFeatures = tableFeatures({
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
})
