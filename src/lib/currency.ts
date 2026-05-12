export function applyDiscount(askingJpy: number, discountPercent: number): number {
  const clean = Math.max(0, askingJpy)
  const pct = Math.max(0, Math.min(100, discountPercent))
  return Math.round(clean * (1 - pct / 100))
}

export function jpyToUsd(jpy: number, rate: number): number {
  return Math.round(jpy * rate * 100) / 100
}

export function jpyToHkd(jpy: number, rate: number): number {
  return Math.round(jpy * rate * 100) / 100
}

export function hkdToJpy(hkd: number, jpyToHkdRate: number): number {
  if (jpyToHkdRate <= 0) return 0
  return Math.round(hkd / jpyToHkdRate)
}

interface ItemForEffective {
  status: 'spotted' | 'bought' | 'passed'
  discountedJpy: number
  finalPaidJpy: number | null
}

export function effectiveItemJpy(item: ItemForEffective): number {
  if (item.status === 'bought' && item.finalPaidJpy != null) {
    return item.finalPaidJpy
  }
  return item.discountedJpy
}

interface ItemForBudget {
  status: 'spotted' | 'bought' | 'passed'
  discountedJpy: number
  finalPaidJpy: number | null
}

export function budgetRemaining(
  budgetJpy: number,
  items: ItemForBudget[],
): number {
  const spent = items
    .filter((i) => i.status === 'bought' && i.finalPaidJpy != null)
    .reduce((sum, i) => sum + (i.finalPaidJpy ?? 0), 0)
  return budgetJpy - spent
}

export function formatJpy(jpy: number): string {
  const sign = jpy < 0 ? '-' : ''
  const abs = Math.abs(Math.round(jpy))
  return `${sign}¥${abs.toLocaleString('en-US')}`
}

function formatCurrencyWithThreshold(value: number, prefix: string): string {
  const abs = Math.abs(value)
  const sign = value < 0 ? '-' : ''
  const decimals = abs >= 100 ? 0 : 2
  const rounded = decimals === 0 ? Math.round(abs) : abs.toFixed(2)
  const num = typeof rounded === 'number'
    ? rounded.toLocaleString('en-US')
    : Number(rounded).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return `${sign}${prefix}${num}`
}

export function formatUsd(usd: number): string {
  return formatCurrencyWithThreshold(usd, 'US$')
}

export function formatHkd(hkd: number): string {
  return formatCurrencyWithThreshold(hkd, 'HK$')
}
