import { describe, expect, test } from 'vitest'
import {
  applyDiscount,
  jpyToUsd,
  jpyToHkd,
  hkdToJpy,
  effectiveItemJpy,
  budgetRemaining,
  formatJpy,
  formatUsd,
  formatHkd,
} from './currency'

describe('applyDiscount', () => {
  test('rounds to nearest yen', () => {
    expect(applyDiscount(45000, 10)).toBe(40500)
    expect(applyDiscount(33333, 15)).toBe(28333) // 33333 * 0.85 = 28333.05 → 28333
  })
  test('zero discount returns the asking price', () => {
    expect(applyDiscount(20000, 0)).toBe(20000)
  })
  test('clamps negative inputs to non-negative', () => {
    expect(applyDiscount(0, 50)).toBe(0)
  })
})

describe('jpyToUsd / jpyToHkd', () => {
  test('multiplies and rounds to 2 decimal places', () => {
    expect(jpyToUsd(10000, 0.00657)).toBe(65.7)
    expect(jpyToHkd(10000, 0.0509)).toBe(509)
  })
  test('returns 0 for 0 yen', () => {
    expect(jpyToUsd(0, 0.00657)).toBe(0)
  })
})

describe('hkdToJpy', () => {
  test('inverts the jpyToHkd rate and rounds to yen', () => {
    expect(hkdToJpy(1000, 0.0509)).toBe(19646) // 1000 / 0.0509 = 19646.36...
  })
  test('returns 0 if rate is 0 (guard against div by zero)', () => {
    expect(hkdToJpy(1000, 0)).toBe(0)
  })
})

describe('effectiveItemJpy', () => {
  test('returns finalPaidJpy when bought', () => {
    const item = {
      status: 'bought' as const,
      discountedJpy: 50000,
      finalPaidJpy: 45000,
    }
    expect(effectiveItemJpy(item)).toBe(45000)
  })
  test('returns discountedJpy when not bought', () => {
    const item = {
      status: 'spotted' as const,
      discountedJpy: 50000,
      finalPaidJpy: null,
    }
    expect(effectiveItemJpy(item)).toBe(50000)
  })
  test('falls back to discountedJpy when bought but finalPaidJpy is missing', () => {
    const item = {
      status: 'bought' as const,
      discountedJpy: 50000,
      finalPaidJpy: null,
    }
    expect(effectiveItemJpy(item)).toBe(50000)
  })
})

describe('budgetRemaining', () => {
  test('subtracts finalPaidJpy of bought items', () => {
    const items = [
      { status: 'bought' as const, discountedJpy: 50000, finalPaidJpy: 45000 },
      { status: 'bought' as const, discountedJpy: 30000, finalPaidJpy: 28000 },
      { status: 'spotted' as const, discountedJpy: 20000, finalPaidJpy: null },
      { status: 'passed' as const, discountedJpy: 15000, finalPaidJpy: null },
    ]
    expect(budgetRemaining(300000, items)).toBe(227000)
  })
  test('can go negative when overspent', () => {
    const items = [
      { status: 'bought' as const, discountedJpy: 0, finalPaidJpy: 400000 },
    ]
    expect(budgetRemaining(300000, items)).toBe(-100000)
  })
})

describe('formatters', () => {
  test('formatJpy includes thousand separators and ¥ prefix', () => {
    expect(formatJpy(245000)).toBe('¥245,000')
    expect(formatJpy(0)).toBe('¥0')
    expect(formatJpy(-100000)).toBe('-¥100,000')
  })
  test('formatUsd rounds to 0 decimals over 100, 2 decimals under', () => {
    expect(formatUsd(265.43)).toBe('US$265')
    expect(formatUsd(12.5)).toBe('US$12.50')
  })
  test('formatHkd uses HK$ prefix', () => {
    expect(formatHkd(2060)).toBe('HK$2,060')
    expect(formatHkd(15.5)).toBe('HK$15.50')
  })
})
