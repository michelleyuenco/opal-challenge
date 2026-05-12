import type { Item } from './types'

export function normalizeQuery(q: string): string {
  return q.trim().toLowerCase()
}

export function matchesRemark(item: Item, query: string): boolean {
  const q = normalizeQuery(query)
  if (q.length === 0) return true
  return item.remark.toLowerCase().includes(q)
}

export function filterItems(
  items: Item[],
  opts: {
    status?: 'all' | Item['status']
    minStars?: number
    boothId?: string | null
    query?: string
  },
): Item[] {
  const { status = 'all', minStars = 0, boothId = null, query = '' } = opts
  return items.filter((i) => {
    if (status !== 'all' && i.status !== status) return false
    if (i.interestStars < minStars) return false
    if (boothId && i.boothId !== boothId) return false
    if (!matchesRemark(i, query)) return false
    return true
  })
}
