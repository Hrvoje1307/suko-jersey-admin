import type { OrderStatus } from '../model/types'

// Hladnije boje dok je narudžba u obradi, zelena kad je dostavljena.
export const ORDER_STATUS_BADGE_CLASSES: Record<OrderStatus, string> = {
  ordered: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
  sent_to_supplier: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  arrived_hr: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300',
  shipped: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
  delivered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
}
