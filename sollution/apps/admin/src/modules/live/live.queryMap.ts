import { BRANCHES_MANAGE_QUERY_KEY, BRANCHES_QUERY_KEY } from '@/api/OrderBooking/modules/branches/branchesHooks'
import { CATEGORIES_QUERY_KEY } from '@/api/OrderBooking/modules/categories/categoriesHooks'
import { ORDERS_ROOT_QUERY_KEY } from '@/api/OrderBooking/modules/orders/ordersHooks'
import { PRODUCTS_QUERY_KEY } from '@/api/OrderBooking/modules/products/productsHooks'
import { SETTINGS_QUERY_KEY } from '@/api/OrderBooking/modules/settings/settingsHooks'

/**
 * Live `type` prefix → React Query keys to invalidate.
 * Add a row when a new catalog domain is streamed.
 */
export function queryKeysForLiveEvent(type: string): readonly (readonly unknown[])[] {
  if (type.startsWith('order.')) return [ORDERS_ROOT_QUERY_KEY]
  if (type.startsWith('product.')) return [PRODUCTS_QUERY_KEY]
  if (type.startsWith('category.')) return [CATEGORIES_QUERY_KEY]
  if (type.startsWith('branch.')) {
    return [BRANCHES_QUERY_KEY, BRANCHES_MANAGE_QUERY_KEY]
  }
  if (type.startsWith('setting.')) return [SETTINGS_QUERY_KEY]
  return []
}
