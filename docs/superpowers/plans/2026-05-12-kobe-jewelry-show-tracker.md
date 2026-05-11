# Kobe Opal Show Tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a two-phone real-time-shared web app for tracking opal/jewelry purchases at the Kobe show (and future shows), per the design at `docs/superpowers/specs/2026-05-12-kobe-jewelry-show-tracker-design.md`.

**Architecture:** React 19 + TypeScript + Tailwind. Firebase Auth (Google) + Firestore + Storage. Custom hooks wrap Firestore `onSnapshot` listeners. React Context for current-trip-id. React Hook Form for forms. `browser-image-compression` for photo compression. No global state library.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind 4, Firebase 12, react-router-dom 7, react-hook-form 7, browser-image-compression, vitest (for pure-function tests).

**Time pressure note:** The first show is tomorrow (2026-05-13). Tasks 1–11 form the MVP that ships for the show. Tasks 12–16 (booth-detail view, collaborator UI, security rule hardening, deploy, UAT) can be completed in parallel with show-floor use or on the plane home.

---

## File map

Files this plan creates:

```
firestore.rules                                      (rewritten in Task 15)
storage.rules                                        (rewritten in Task 15)
firestore.indexes.json                               (rewritten in Task 15)
src/firebase.ts                                      (moved from infrastructure/config)
src/main.tsx                                         (rewritten Task 1)
src/App.tsx                                          (rewritten Task 1)
src/index.css                                        (unchanged)
src/lib/types.ts                                     (Task 1)
src/lib/currency.ts                                  (Task 2, TDD)
src/lib/currency.test.ts                             (Task 2, TDD)
src/lib/search.ts                                    (Task 3)
src/lib/firestorePaths.ts                            (Task 4)
src/context/AuthContext.tsx                          (Task 4)
src/context/TripContext.tsx                          (Task 5)
src/hooks/useAuth.ts                                 (Task 4)
src/hooks/useTrips.ts                                (Task 5)
src/hooks/useTrip.ts                                 (Task 5)
src/hooks/useBooths.ts                               (Task 7)
src/hooks/useItems.ts                                (Task 8)
src/hooks/useUploadPhoto.ts                          (Task 10)
src/pages/SignInPage.tsx                             (Task 4)
src/pages/TripPickerPage.tsx                         (Task 5)
src/pages/ItemsPage.tsx                              (Task 8 + Task 12)
src/pages/ItemDetailPage.tsx                         (Task 9 + Task 11)
src/pages/BoothsPage.tsx                             (Task 7)
src/pages/BoothDetailPage.tsx                        (Task 13)
src/pages/SettingsPage.tsx                           (Task 6 + Task 11 + Task 14)
src/components/layout/TripLayout.tsx                 (Task 5)
src/components/layout/BottomNav.tsx                  (Task 5)
src/components/layout/ProtectedRoute.tsx             (Task 4)
src/components/layout/OfflineBanner.tsx              (Task 12)
src/components/ui/Button.tsx                         (Task 1)
src/components/ui/Input.tsx                          (Task 1)
src/components/ui/Sheet.tsx                          (Task 1)
src/components/ui/Chip.tsx                           (Task 1)
src/components/booths/BoothForm.tsx                  (Task 7)
src/components/booths/BoothPicker.tsx                (Task 7)
src/components/items/ItemCard.tsx                    (Task 8)
src/components/items/QuickAddSheet.tsx               (Task 8)
src/components/items/StatusPill.tsx                  (Task 9)
src/components/items/StarRating.tsx                  (Task 9)
src/components/items/OpalTagInput.tsx                (Task 9)
src/components/items/PhotoUploader.tsx               (Task 10)
src/components/items/PhotoGallery.tsx                (Task 10)
src/components/budget/BudgetCard.tsx                 (Task 11)
src/components/budget/BudgetAdjustSheet.tsx          (Task 11)
src/components/budget/RateEditor.tsx                 (Task 11)
```

---

## Task 1: Scaffold deps, types, primitives, route table

**Files:**
- Modify: `package.json`
- Move: `src/infrastructure/config/firebase.config.ts` → `src/firebase.ts`
- Create: `src/lib/types.ts`
- Create: `src/components/ui/Button.tsx`
- Create: `src/components/ui/Input.tsx`
- Create: `src/components/ui/Sheet.tsx`
- Create: `src/components/ui/Chip.tsx`
- Rewrite: `src/main.tsx`
- Rewrite: `src/App.tsx`

- [ ] **Step 1: Add dependencies**

Run:
```bash
npm install react-router-dom@^7 react-hook-form@^7 browser-image-compression@^2 clsx@^2
npm install -D vitest@^4 @types/uuid jsdom@^29
```

Expected: installs without error.

- [ ] **Step 2: Move firebase config to src/firebase.ts**

Run:
```bash
mv src/infrastructure/config/firebase.config.ts src/firebase.ts
rmdir src/infrastructure/config src/infrastructure
```

Open `src/firebase.ts`; it requires no content change — the existing init exporting `auth`, `db`, `storage` works as-is from the new path.

- [ ] **Step 3: Create `src/lib/types.ts`**

```typescript
import type { Timestamp } from 'firebase/firestore'

export type FormFactor =
  | 'loose-stone'
  | 'ring'
  | 'pendant'
  | 'earrings'
  | 'necklace'
  | 'brooch'
  | 'bracelet'
  | 'other'

export const FORM_FACTORS: FormFactor[] = [
  'loose-stone',
  'ring',
  'pendant',
  'earrings',
  'necklace',
  'brooch',
  'bracelet',
  'other',
]

export const FORM_FACTOR_LABELS: Record<FormFactor, string> = {
  'loose-stone': 'Loose stone',
  ring: 'Ring',
  pendant: 'Pendant',
  earrings: 'Earrings',
  necklace: 'Necklace',
  brooch: 'Brooch',
  bracelet: 'Bracelet',
  other: 'Other',
}

export type ItemStatus = 'spotted' | 'bought' | 'passed'

export interface Photo {
  photoId: string
  storagePath: string
  thumbPath: string | null
  width: number
  height: number
  uploadedAt: Timestamp
  uploadedByUid: string
}

export interface Trip {
  id: string
  name: string
  startDate: Timestamp | null
  endDate: Timestamp | null
  ownerUid: string
  collaboratorUids: string[]
  budgetJpy: number
  rates: {
    jpyToUsd: number
    jpyToHkd: number
    updatedAt: Timestamp
  }
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface Booth {
  id: string
  number: string
  vendorName: string
  note: string
  createdAt: Timestamp
  createdByUid: string
}

export interface Item {
  id: string
  boothId: string
  formFactor: FormFactor
  opalTypeTags: string[]
  remark: string

  vendorAskingJpy: number
  discountPercent: number
  discountedJpy: number
  targetBuyJpy: number | null
  plannedResaleJpy: number | null
  finalPaidJpy: number | null

  overrideUsd: number | null
  overrideHkd: number | null

  status: ItemStatus
  interestStars: number

  photos: Photo[]

  createdAt: Timestamp
  createdByUid: string
  updatedAt: Timestamp
  updatedByUid: string
}

export interface AppUser {
  uid: string
  email: string
  displayName: string
  photoURL: string
}
```

- [ ] **Step 4: Create `src/components/ui/Button.tsx`**

```tsx
import { clsx } from 'clsx'
import type { ButtonHTMLAttributes } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

const variants = {
  primary: 'bg-neutral-900 text-white hover:bg-neutral-800',
  secondary: 'bg-white text-neutral-900 border border-neutral-200 hover:bg-neutral-50',
  ghost: 'bg-transparent text-neutral-700 hover:bg-neutral-100',
  danger: 'bg-red-600 text-white hover:bg-red-700',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-3 text-base',
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: Props) {
  return (
    <button
      className={clsx(
        'rounded-full font-medium transition disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  )
}
```

- [ ] **Step 5: Create `src/components/ui/Input.tsx`**

```tsx
import { clsx } from 'clsx'
import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  suffix?: string
}

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, error, suffix, className, ...props },
  ref,
) {
  return (
    <label className="block">
      {label && (
        <span className="block text-sm font-medium text-neutral-700 mb-1">
          {label}
        </span>
      )}
      <div className="relative">
        <input
          ref={ref}
          className={clsx(
            'block w-full rounded-lg border border-neutral-300 bg-white px-3 py-2',
            'text-sm focus:border-neutral-900 focus:outline-none',
            suffix && 'pr-12',
            error && 'border-red-500',
            className,
          )}
          {...props}
        />
        {suffix && (
          <span className="absolute inset-y-0 right-3 flex items-center text-sm text-neutral-500">
            {suffix}
          </span>
        )}
      </div>
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  )
})
```

- [ ] **Step 6: Create `src/components/ui/Sheet.tsx`**

```tsx
import { useEffect } from 'react'
import type { ReactNode } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

export function Sheet({ open, onClose, title, children }: Props) {
  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative w-full max-w-md rounded-t-2xl bg-white p-4 pb-8 shadow-xl sm:rounded-2xl sm:mb-4">
        {title && (
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="rounded-full p-1 text-neutral-500 hover:bg-neutral-100"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Create `src/components/ui/Chip.tsx`**

```tsx
import { clsx } from 'clsx'
import type { ButtonHTMLAttributes } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
}

export function Chip({ active, className, ...props }: Props) {
  return (
    <button
      type="button"
      className={clsx(
        'whitespace-nowrap rounded-full border px-3 py-1 text-xs transition',
        active
          ? 'border-neutral-900 bg-neutral-900 text-white'
          : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50',
        className,
      )}
      {...props}
    />
  )
}
```

- [ ] **Step 8: Rewrite `src/main.tsx`**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
```

- [ ] **Step 9: Rewrite `src/App.tsx`**

For now a placeholder route table; pages are stubbed and filled in later tasks.

```tsx
import { Routes, Route, Navigate } from 'react-router-dom'

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<div className="p-6">Sign-in (Task 4)</div>} />
      <Route path="/" element={<div className="p-6">Trip picker (Task 5)</div>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
```

- [ ] **Step 10: Verify build**

Run:
```bash
./node_modules/.bin/tsc -b && ./node_modules/.bin/vite build
```

Expected: no type errors, build succeeds. Then `rm -rf dist`.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
Scaffold tracker app: deps, types, UI primitives, route table

- Install react-router-dom, react-hook-form, browser-image-compression,
  clsx, vitest, jsdom
- Move firebase config to src/firebase.ts
- Add types module: Trip, Booth, Item, Photo, FormFactor, ItemStatus
- Add UI primitives: Button, Input, Sheet, Chip
- Wire BrowserRouter and stub route table

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Currency math library (TDD)

**Files:**
- Create: `src/lib/currency.ts`
- Create: `src/lib/currency.test.ts`
- Modify: `package.json` (add `test` script)
- Create: `vitest.config.ts`

- [ ] **Step 1: Add vitest config and test script**

Create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
  },
})
```

Edit `package.json` `scripts`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 2: Write failing tests for currency.ts**

Create `src/lib/currency.test.ts`:
```typescript
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
```

- [ ] **Step 3: Run tests, expect failure**

Run:
```bash
npm test
```

Expected: "Cannot find module './currency'" — failing because the file does not exist yet.

- [ ] **Step 4: Implement `src/lib/currency.ts`**

```typescript
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
```

- [ ] **Step 5: Run tests, expect pass**

Run:
```bash
npm test
```

Expected: all 14+ tests pass.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
Add currency math library with TDD coverage

Pure-function helpers for discount, JPY↔USD/HKD conversion, effective
item price, budget remaining, and formatters. All math centralized
here so list views and budget cards stay dumb.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Search helper

**Files:**
- Create: `src/lib/search.ts`

- [ ] **Step 1: Create `src/lib/search.ts`**

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/search.ts
git commit -m "$(cat <<'EOF'
Add client-side item search and filter

Case-insensitive substring match on remark plus status / star / booth
filters. Operates on the already-subscribed item list so it works
offline and avoids extra Firestore reads.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Auth + sign-in page + protected routing

**Files:**
- Create: `src/lib/firestorePaths.ts`
- Create: `src/context/AuthContext.tsx`
- Create: `src/hooks/useAuth.ts`
- Create: `src/components/layout/ProtectedRoute.tsx`
- Create: `src/pages/SignInPage.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create `src/lib/firestorePaths.ts`**

```typescript
import { collection, doc } from 'firebase/firestore'
import { db } from '../firebase'

export const usersCol = () => collection(db, 'users')
export const userDoc = (uid: string) => doc(db, 'users', uid)

export const tripsCol = () => collection(db, 'trips')
export const tripDoc = (tripId: string) => doc(db, 'trips', tripId)

export const boothsCol = (tripId: string) =>
  collection(db, 'trips', tripId, 'booths')
export const boothDoc = (tripId: string, boothId: string) =>
  doc(db, 'trips', tripId, 'booths', boothId)

export const itemsCol = (tripId: string) =>
  collection(db, 'trips', tripId, 'items')
export const itemDoc = (tripId: string, itemId: string) =>
  doc(db, 'trips', tripId, 'items', itemId)

export const itemPhotoStoragePath = (
  tripId: string,
  itemId: string,
  photoId: string,
): string => `trips/${tripId}/items/${itemId}/${photoId}.jpg`
```

- [ ] **Step 2: Create `src/context/AuthContext.tsx`**

```tsx
import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { setDoc, serverTimestamp } from 'firebase/firestore'
import { auth } from '../firebase'
import { userDoc } from '../lib/firestorePaths'

interface AuthCtx {
  user: User | null
  loading: boolean
}

const Ctx = createContext<AuthCtx>({ user: null, loading: true })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u)
      setLoading(false)
      if (u) {
        await setDoc(
          userDoc(u.uid),
          {
            email: u.email ?? '',
            displayName: u.displayName ?? '',
            photoURL: u.photoURL ?? '',
            createdAt: serverTimestamp(),
          },
          { merge: true },
        )
      }
    })
  }, [])

  return <Ctx.Provider value={{ user, loading }}>{children}</Ctx.Provider>
}

export function useAuthContext(): AuthCtx {
  return useContext(Ctx)
}
```

- [ ] **Step 3: Create `src/hooks/useAuth.ts`**

```typescript
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'
import { auth } from '../firebase'
import { useAuthContext } from '../context/AuthContext'

export function useAuth() {
  const { user, loading } = useAuthContext()
  return {
    user,
    loading,
    signIn: () => signInWithPopup(auth, new GoogleAuthProvider()),
    signOut: () => signOut(auth),
  }
}
```

- [ ] **Step 4: Create `src/components/layout/ProtectedRoute.tsx`**

```tsx
import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../../hooks/useAuth'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-neutral-500">
        Loading…
      </div>
    )
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return <>{children}</>
}
```

- [ ] **Step 5: Create `src/pages/SignInPage.tsx`**

```tsx
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'

export function SignInPage() {
  const { user, signIn } = useAuth()
  const navigate = useNavigate()

  if (user) {
    navigate('/', { replace: true })
    return null
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Opal Show Tracker</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Sign in to track potential buys across your trips.
        </p>
      </div>
      <Button onClick={signIn} size="lg">
        Continue with Google
      </Button>
    </div>
  )
}
```

- [ ] **Step 6: Update `src/App.tsx` to wrap with AuthProvider and protect routes**

```tsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { SignInPage } from './pages/SignInPage'

export function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<SignInPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <div className="p-6">Trip picker (Task 5)</div>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
```

- [ ] **Step 7: Manual smoke test**

Run `npm run dev` (it should still be running from the earlier session at http://localhost:5175). Open the URL; you should be redirected to `/login` and see the "Continue with Google" button. Click it — if Google sign-in works against your Firebase project, you should land on `/` showing "Trip picker (Task 5)". If env vars are missing, you'll see a thrown error in the console; fill in `.env` and reload.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
Add Google auth, protected routing, and sign-in page

AuthProvider subscribes to onAuthStateChanged and upserts the user's
profile to /users/{uid}. useAuth exposes user, signIn, signOut.
ProtectedRoute redirects unauthenticated users to /login.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Trip list, trip picker, create-trip flow, TripLayout

**Files:**
- Create: `src/context/TripContext.tsx`
- Create: `src/hooks/useTrips.ts`
- Create: `src/hooks/useTrip.ts`
- Create: `src/pages/TripPickerPage.tsx`
- Create: `src/components/layout/BottomNav.tsx`
- Create: `src/components/layout/TripLayout.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create `src/hooks/useTrips.ts`**

Two parallel listeners (owned + collaborator) merged client-side; Firestore can't `or` across fields without the new OR operator, but two listeners is simpler and avoids index drama.

```typescript
import { useEffect, useState } from 'react'
import {
  onSnapshot,
  query,
  where,
  orderBy,
  type DocumentData,
  type QuerySnapshot,
} from 'firebase/firestore'
import { tripsCol } from '../lib/firestorePaths'
import type { Trip } from '../lib/types'
import { useAuth } from './useAuth'

function snapToTrips(snap: QuerySnapshot<DocumentData>): Trip[] {
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Trip, 'id'>) }))
}

export function useTrips() {
  const { user } = useAuth()
  const [owned, setOwned] = useState<Trip[]>([])
  const [collab, setCollab] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setOwned([])
      setCollab([])
      setLoading(false)
      return
    }
    setLoading(true)
    const qOwned = query(
      tripsCol(),
      where('ownerUid', '==', user.uid),
      orderBy('updatedAt', 'desc'),
    )
    const qCollab = query(
      tripsCol(),
      where('collaboratorUids', 'array-contains', user.uid),
      orderBy('updatedAt', 'desc'),
    )
    let gotOwned = false
    let gotCollab = false
    const stopL = () => {
      if (gotOwned && gotCollab) setLoading(false)
    }
    const unsubA = onSnapshot(qOwned, (s) => {
      setOwned(snapToTrips(s))
      gotOwned = true
      stopL()
    })
    const unsubB = onSnapshot(qCollab, (s) => {
      setCollab(snapToTrips(s))
      gotCollab = true
      stopL()
    })
    return () => {
      unsubA()
      unsubB()
    }
  }, [user])

  const all = [...owned, ...collab].sort(
    (a, b) => (b.updatedAt?.toMillis?.() ?? 0) - (a.updatedAt?.toMillis?.() ?? 0),
  )
  return { trips: all, loading }
}
```

- [ ] **Step 2: Create `src/hooks/useTrip.ts`**

```typescript
import { useEffect, useState } from 'react'
import { onSnapshot } from 'firebase/firestore'
import { tripDoc } from '../lib/firestorePaths'
import type { Trip } from '../lib/types'

export function useTrip(tripId: string | null) {
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tripId) {
      setTrip(null)
      setLoading(false)
      return
    }
    setLoading(true)
    return onSnapshot(tripDoc(tripId), (snap) => {
      if (!snap.exists()) {
        setTrip(null)
      } else {
        setTrip({ id: snap.id, ...(snap.data() as Omit<Trip, 'id'>) })
      }
      setLoading(false)
    })
  }, [tripId])

  return { trip, loading }
}
```

- [ ] **Step 3: Create `src/context/TripContext.tsx`**

```tsx
import { createContext, useContext } from 'react'
import type { Trip } from '../lib/types'

interface TripCtx {
  trip: Trip
}

const Ctx = createContext<TripCtx | null>(null)

export function TripProvider({
  trip,
  children,
}: {
  trip: Trip
  children: React.ReactNode
}) {
  return <Ctx.Provider value={{ trip }}>{children}</Ctx.Provider>
}

export function useTripContext(): TripCtx {
  const v = useContext(Ctx)
  if (!v) throw new Error('useTripContext must be inside <TripProvider>')
  return v
}
```

- [ ] **Step 4: Create `src/components/layout/BottomNav.tsx`**

```tsx
import { NavLink, useParams } from 'react-router-dom'
import { clsx } from 'clsx'

export function BottomNav() {
  const { tripId } = useParams<{ tripId: string }>()
  if (!tripId) return null

  const tabs = [
    { to: `/trips/${tripId}`, label: 'Items', end: true },
    { to: `/trips/${tripId}/booths`, label: 'Booths', end: false },
    { to: `/trips/${tripId}/settings`, label: 'Settings', end: false },
  ]

  return (
    <nav className="sticky bottom-0 grid grid-cols-3 border-t border-neutral-200 bg-white">
      {tabs.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          end={t.end}
          className={({ isActive }) =>
            clsx(
              'py-3 text-center text-sm',
              isActive ? 'font-semibold text-neutral-900' : 'text-neutral-500',
            )
          }
        >
          {t.label}
        </NavLink>
      ))}
    </nav>
  )
}
```

- [ ] **Step 5: Create `src/components/layout/TripLayout.tsx`**

```tsx
import { Outlet, useParams, Navigate } from 'react-router-dom'
import { useTrip } from '../../hooks/useTrip'
import { TripProvider } from '../../context/TripContext'
import { BottomNav } from './BottomNav'

export function TripLayout() {
  const { tripId } = useParams<{ tripId: string }>()
  const { trip, loading } = useTrip(tripId ?? null)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-neutral-500">
        Loading trip…
      </div>
    )
  }
  if (!trip) {
    return <Navigate to="/" replace />
  }

  return (
    <TripProvider trip={trip}>
      <div className="flex min-h-screen flex-col bg-neutral-50">
        <main className="flex-1 pb-2">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </TripProvider>
  )
}
```

- [ ] **Step 6: Create `src/pages/TripPickerPage.tsx`**

```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { addDoc, serverTimestamp } from 'firebase/firestore'
import { useTrips } from '../hooks/useTrips'
import { useAuth } from '../hooks/useAuth'
import { tripsCol } from '../lib/firestorePaths'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Sheet } from '../components/ui/Sheet'

export function TripPickerPage() {
  const { user, signOut } = useAuth()
  const { trips, loading } = useTrips()
  const navigate = useNavigate()
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)

  async function createTrip() {
    if (!user || !name.trim()) return
    setBusy(true)
    try {
      const ref = await addDoc(tripsCol(), {
        name: name.trim(),
        startDate: null,
        endDate: null,
        ownerUid: user.uid,
        collaboratorUids: [],
        budgetJpy: 0,
        rates: {
          jpyToUsd: 0.00657,
          jpyToHkd: 0.0509,
          updatedAt: serverTimestamp(),
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      setCreating(false)
      setName('')
      navigate(`/trips/${ref.id}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Your Trips</h1>
          <p className="text-xs text-neutral-500">{user?.email}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => signOut()}>
          Sign out
        </Button>
      </div>

      {loading && <div className="text-sm text-neutral-500">Loading…</div>}

      {!loading && trips.length === 0 && (
        <div className="rounded-xl border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500">
          No trips yet. Create one to start tracking.
        </div>
      )}

      <div className="space-y-2">
        {trips.map((t) => (
          <button
            key={t.id}
            onClick={() => navigate(`/trips/${t.id}`)}
            className="block w-full rounded-xl border border-neutral-200 bg-white p-4 text-left hover:bg-neutral-50"
          >
            <div className="font-medium">{t.name}</div>
            <div className="text-xs text-neutral-500">
              {t.ownerUid === user?.uid ? 'Owner' : 'Collaborator'} ·
              budget ¥{t.budgetJpy.toLocaleString()}
            </div>
          </button>
        ))}
      </div>

      <Button className="mt-6 w-full" size="lg" onClick={() => setCreating(true)}>
        ＋ New trip
      </Button>

      <Sheet open={creating} onClose={() => setCreating(false)} title="New trip">
        <div className="space-y-3">
          <Input
            label="Trip name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Kobe Show — May 2026"
          />
          <Button onClick={createTrip} disabled={!name.trim() || busy} className="w-full">
            {busy ? 'Creating…' : 'Create'}
          </Button>
        </div>
      </Sheet>
    </div>
  )
}
```

- [ ] **Step 7: Update `src/App.tsx` to register the new routes**

```tsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { SignInPage } from './pages/SignInPage'
import { TripPickerPage } from './pages/TripPickerPage'
import { TripLayout } from './components/layout/TripLayout'

export function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<SignInPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <TripPickerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trips/:tripId"
          element={
            <ProtectedRoute>
              <TripLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<div className="p-4">Items (Task 8)</div>} />
          <Route path="booths" element={<div className="p-4">Booths (Task 7)</div>} />
          <Route path="settings" element={<div className="p-4">Settings (Task 6)</div>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
```

- [ ] **Step 8: Manual smoke test**

Reload the dev URL. Sign in → land on Trip Picker. Tap "New trip", enter "Test trip", create. You should be navigated to `/trips/:id` with the three-tab bottom nav visible.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
Add trip picker, trip layout, and create-trip flow

useTrips merges owned + collaborator listeners. useTrip subscribes to
a single trip doc. TripLayout provides TripContext + BottomNav to
nested routes. New-trip sheet seeds default rates (0.00657 USD / 0.0509 HKD).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Settings page skeleton (trip name, dates, leave/delete)

**Files:**
- Create: `src/pages/SettingsPage.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create `src/pages/SettingsPage.tsx`**

```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { updateDoc, deleteDoc, serverTimestamp, arrayRemove } from 'firebase/firestore'
import { useTripContext } from '../context/TripContext'
import { useAuth } from '../hooks/useAuth'
import { tripDoc } from '../lib/firestorePaths'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export function SettingsPage() {
  const { trip } = useTripContext()
  const { user } = useAuth()
  const navigate = useNavigate()
  const isOwner = user?.uid === trip.ownerUid

  const [name, setName] = useState(trip.name)
  const [savingName, setSavingName] = useState(false)

  async function saveName() {
    if (!name.trim() || name === trip.name) return
    setSavingName(true)
    try {
      await updateDoc(tripDoc(trip.id), {
        name: name.trim(),
        updatedAt: serverTimestamp(),
      })
    } finally {
      setSavingName(false)
    }
  }

  async function leaveTrip() {
    if (!user) return
    if (!confirm('Leave this trip? You will lose access.')) return
    await updateDoc(tripDoc(trip.id), {
      collaboratorUids: arrayRemove(user.uid),
      updatedAt: serverTimestamp(),
    })
    navigate('/')
  }

  async function deleteTrip() {
    if (!confirm(`Delete "${trip.name}"? Items and booths are not auto-deleted yet.`)) return
    await deleteDoc(tripDoc(trip.id))
    navigate('/')
  }

  return (
    <div className="mx-auto max-w-md space-y-6 px-4 py-6">
      <h1 className="text-xl font-semibold">Trip settings</h1>

      <section className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4">
        <Input label="Trip name" value={name} onChange={(e) => setName(e.target.value)} />
        <Button onClick={saveName} disabled={savingName || name === trip.name}>
          {savingName ? 'Saving…' : 'Save'}
        </Button>
      </section>

      <section className="space-y-2 rounded-xl border border-neutral-200 bg-white p-4 text-sm">
        <div className="font-medium">Members</div>
        <div className="text-neutral-600">Owner: {trip.ownerUid === user?.uid ? 'you' : trip.ownerUid}</div>
        <div className="text-neutral-600">
          Collaborators: {trip.collaboratorUids.length === 0 ? '—' : trip.collaboratorUids.join(', ')}
        </div>
        <p className="text-xs text-neutral-500">Invite UI added in Task 14.</p>
      </section>

      <section className="space-y-2 rounded-xl border border-neutral-200 bg-white p-4">
        <div className="text-sm font-medium">Budget &amp; rates</div>
        <p className="text-xs text-neutral-500">Added in Task 11.</p>
      </section>

      <div className="pt-2">
        {isOwner ? (
          <Button variant="danger" onClick={deleteTrip} className="w-full">
            Delete trip
          </Button>
        ) : (
          <Button variant="danger" onClick={leaveTrip} className="w-full">
            Leave trip
          </Button>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Wire route**

In `src/App.tsx`, replace the placeholder `/settings` route element with `<SettingsPage />` and add the import.

```tsx
import { SettingsPage } from './pages/SettingsPage'
```

```tsx
<Route path="settings" element={<SettingsPage />} />
```

- [ ] **Step 3: Smoke test, then commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
Add Settings page skeleton

Rename trip, list members, leave (collaborator) or delete (owner).
Budget/rate editing and invite UI land in later tasks.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Booths — hook, list page, form, picker

**Files:**
- Create: `src/hooks/useBooths.ts`
- Create: `src/components/booths/BoothForm.tsx`
- Create: `src/components/booths/BoothPicker.tsx`
- Create: `src/pages/BoothsPage.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create `src/hooks/useBooths.ts`**

```typescript
import { useEffect, useState } from 'react'
import { onSnapshot, orderBy, query } from 'firebase/firestore'
import { boothsCol } from '../lib/firestorePaths'
import type { Booth } from '../lib/types'

export function useBooths(tripId: string) {
  const [booths, setBooths] = useState<Booth[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(boothsCol(tripId), orderBy('number'))
    setLoading(true)
    return onSnapshot(q, (snap) => {
      setBooths(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Booth, 'id'>) })),
      )
      setLoading(false)
    })
  }, [tripId])

  return { booths, loading }
}
```

- [ ] **Step 2: Create `src/components/booths/BoothForm.tsx`**

```tsx
import { useState } from 'react'
import { addDoc, serverTimestamp } from 'firebase/firestore'
import { boothsCol } from '../../lib/firestorePaths'
import { useTripContext } from '../../context/TripContext'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

export function BoothForm({
  onCreated,
}: {
  onCreated?: (boothId: string) => void
}) {
  const { trip } = useTripContext()
  const { user } = useAuth()
  const [number, setNumber] = useState('')
  const [vendorName, setVendorName] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)

  async function create() {
    if (!user || !number.trim()) return
    setBusy(true)
    try {
      const ref = await addDoc(boothsCol(trip.id), {
        number: number.trim(),
        vendorName: vendorName.trim(),
        note: note.trim(),
        createdAt: serverTimestamp(),
        createdByUid: user.uid,
      })
      setNumber('')
      setVendorName('')
      setNote('')
      onCreated?.(ref.id)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-3">
      <Input label="Booth number" value={number} onChange={(e) => setNumber(e.target.value)} placeholder="C-15" />
      <Input label="Vendor name" value={vendorName} onChange={(e) => setVendorName(e.target.value)} placeholder="Yamamoto Gem" />
      <Input label="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
      <Button onClick={create} disabled={busy || !number.trim()} className="w-full">
        {busy ? 'Saving…' : 'Add booth'}
      </Button>
    </div>
  )
}
```

- [ ] **Step 3: Create `src/components/booths/BoothPicker.tsx`**

```tsx
import { useState } from 'react'
import { useBooths } from '../../hooks/useBooths'
import { useTripContext } from '../../context/TripContext'
import { Sheet } from '../ui/Sheet'
import { BoothForm } from './BoothForm'

interface Props {
  value: string | null
  onChange: (boothId: string) => void
}

export function BoothPicker({ value, onChange }: Props) {
  const { trip } = useTripContext()
  const { booths } = useBooths(trip.id)
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const current = booths.find((b) => b.id === value)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="block w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-left text-sm"
      >
        {current ? (
          <span>
            <span className="font-medium">{current.number}</span>
            {current.vendorName ? ` · ${current.vendorName}` : ''}
          </span>
        ) : (
          <span className="text-neutral-400">Pick a booth</span>
        )}
      </button>

      <Sheet open={open} onClose={() => setOpen(false)} title="Pick booth">
        {creating ? (
          <BoothForm
            onCreated={(id) => {
              onChange(id)
              setCreating(false)
              setOpen(false)
            }}
          />
        ) : (
          <div className="space-y-2">
            {booths.map((b) => (
              <button
                key={b.id}
                onClick={() => {
                  onChange(b.id)
                  setOpen(false)
                }}
                className="block w-full rounded-lg border border-neutral-200 bg-white p-3 text-left hover:bg-neutral-50"
              >
                <div className="font-medium">{b.number}</div>
                {b.vendorName && (
                  <div className="text-xs text-neutral-500">{b.vendorName}</div>
                )}
              </button>
            ))}
            <button
              onClick={() => setCreating(true)}
              className="block w-full rounded-lg border border-dashed border-neutral-300 p-3 text-sm text-neutral-600 hover:bg-neutral-50"
            >
              ＋ New booth
            </button>
          </div>
        )}
      </Sheet>
    </>
  )
}
```

- [ ] **Step 4: Create `src/pages/BoothsPage.tsx`**

```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTripContext } from '../context/TripContext'
import { useBooths } from '../hooks/useBooths'
import { Button } from '../components/ui/Button'
import { Sheet } from '../components/ui/Sheet'
import { BoothForm } from '../components/booths/BoothForm'

export function BoothsPage() {
  const { trip } = useTripContext()
  const { booths, loading } = useBooths(trip.id)
  const navigate = useNavigate()
  const [creating, setCreating] = useState(false)

  return (
    <div className="mx-auto max-w-md px-4 py-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Booths</h1>
        <Button size="sm" onClick={() => setCreating(true)}>
          ＋ Add
        </Button>
      </div>

      {loading && <div className="text-sm text-neutral-500">Loading…</div>}
      {!loading && booths.length === 0 && (
        <div className="rounded-xl border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500">
          No booths yet. Add the first one.
        </div>
      )}

      <div className="space-y-2">
        {booths.map((b) => (
          <button
            key={b.id}
            onClick={() => navigate(`/trips/${trip.id}/booths/${b.id}`)}
            className="block w-full rounded-xl border border-neutral-200 bg-white p-4 text-left hover:bg-neutral-50"
          >
            <div className="font-medium">{b.number}</div>
            {b.vendorName && (
              <div className="text-xs text-neutral-500">{b.vendorName}</div>
            )}
            {b.note && (
              <div className="mt-1 text-xs text-neutral-500">{b.note}</div>
            )}
          </button>
        ))}
      </div>

      <Sheet open={creating} onClose={() => setCreating(false)} title="New booth">
        <BoothForm onCreated={() => setCreating(false)} />
      </Sheet>
    </div>
  )
}
```

- [ ] **Step 5: Wire route in App.tsx**

Replace the placeholder `booths` route element:
```tsx
import { BoothsPage } from './pages/BoothsPage'
```
```tsx
<Route path="booths" element={<BoothsPage />} />
<Route path="booths/:boothId" element={<div className="p-4">Booth detail (Task 13)</div>} />
```

- [ ] **Step 6: Smoke test, then commit**

Create two booths on the dev server. Reload — they persist.

```bash
git add -A
git commit -m "$(cat <<'EOF'
Add booths: hook, list page, form, picker

Booths sort by booth number. Picker doubles as inline create.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Items basic — hook, ItemsPage list, ItemCard, QuickAddSheet

**Files:**
- Create: `src/hooks/useItems.ts`
- Create: `src/components/items/ItemCard.tsx`
- Create: `src/components/items/QuickAddSheet.tsx`
- Create: `src/pages/ItemsPage.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create `src/hooks/useItems.ts`**

```typescript
import { useEffect, useState } from 'react'
import { onSnapshot, orderBy, query } from 'firebase/firestore'
import { itemsCol } from '../lib/firestorePaths'
import type { Item } from '../lib/types'

export function useItems(tripId: string) {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(itemsCol(tripId), orderBy('updatedAt', 'desc'))
    setLoading(true)
    return onSnapshot(q, (snap) => {
      setItems(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Item, 'id'>) })),
      )
      setLoading(false)
    })
  }, [tripId])

  return { items, loading }
}
```

- [ ] **Step 2: Create `src/components/items/ItemCard.tsx`**

```tsx
import { useNavigate } from 'react-router-dom'
import { clsx } from 'clsx'
import type { Item, Booth, Trip } from '../../lib/types'
import {
  formatJpy,
  formatUsd,
  formatHkd,
  jpyToUsd,
  jpyToHkd,
  effectiveItemJpy,
} from '../../lib/currency'
import { FORM_FACTOR_LABELS } from '../../lib/types'

interface Props {
  item: Item
  trip: Trip
  booth: Booth | undefined
}

const statusStyles: Record<Item['status'], string> = {
  spotted: 'bg-indigo-50 text-indigo-700',
  bought: 'bg-emerald-50 text-emerald-700',
  passed: 'bg-neutral-100 text-neutral-500',
}

const statusLabels: Record<Item['status'], string> = {
  spotted: 'Spotted',
  bought: 'Bought ✓',
  passed: 'Passed',
}

export function ItemCard({ item, trip, booth }: Props) {
  const navigate = useNavigate()
  const headlineJpy = effectiveItemJpy(item)
  const headlineUsd = item.overrideUsd ?? jpyToUsd(headlineJpy, trip.rates.jpyToUsd)
  const headlineHkd = item.overrideHkd ?? jpyToHkd(headlineJpy, trip.rates.jpyToHkd)
  const cover = item.photos[0]

  return (
    <button
      onClick={() => navigate(`/trips/${trip.id}/items/${item.id}`)}
      className="flex w-full gap-3 rounded-xl border border-neutral-200 bg-white p-3 text-left hover:bg-neutral-50"
    >
      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-100">
        {cover && (
          <img
            src={`https://firebasestorage.googleapis.com/v0/b/${import.meta.env.VITE_FIREBASE_STORAGE_BUCKET}/o/${encodeURIComponent(cover.storagePath)}?alt=media`}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <div className="truncate text-sm font-semibold">
            {FORM_FACTOR_LABELS[item.formFactor]}
            {item.opalTypeTags.length > 0 && (
              <span className="text-neutral-500"> · {item.opalTypeTags.join(', ')}</span>
            )}
          </div>
          <span className={clsx('rounded-full px-2 py-0.5 text-[10px]', statusStyles[item.status])}>
            {statusLabels[item.status]}
          </span>
        </div>
        <div className="truncate text-xs text-neutral-500">
          {booth ? `${booth.number}${booth.vendorName ? ` · ${booth.vendorName}` : ''}` : 'No booth'}
        </div>
        <div className="mt-1 text-xs">
          {item.status === 'bought' && item.finalPaidJpy != null ? (
            <span className="font-semibold text-emerald-700">{formatJpy(item.finalPaidJpy)} paid</span>
          ) : (
            <>
              {item.discountPercent > 0 && (
                <span className="mr-1 text-neutral-400 line-through">
                  {formatJpy(item.vendorAskingJpy)}
                </span>
              )}
              <span className="font-semibold">{formatJpy(item.discountedJpy)}</span>
              {item.discountPercent > 0 && (
                <span className="ml-1 text-neutral-500">(-{item.discountPercent}%)</span>
              )}
            </>
          )}
        </div>
        <div className="text-[11px] text-neutral-500">
          {formatHkd(headlineHkd)} · {formatUsd(headlineUsd)}
        </div>
        <div className="text-[11px] text-amber-500">
          {'★'.repeat(item.interestStars)}
          <span className="text-neutral-300">{'★'.repeat(5 - item.interestStars)}</span>
        </div>
      </div>
    </button>
  )
}
```

- [ ] **Step 3: Create `src/components/items/QuickAddSheet.tsx`**

```tsx
import { useState } from 'react'
import { addDoc, serverTimestamp } from 'firebase/firestore'
import { useTripContext } from '../../context/TripContext'
import { useAuth } from '../../hooks/useAuth'
import { itemsCol } from '../../lib/firestorePaths'
import { applyDiscount } from '../../lib/currency'
import { Sheet } from '../ui/Sheet'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { BoothPicker } from '../booths/BoothPicker'

interface Props {
  open: boolean
  onClose: () => void
}

export function QuickAddSheet({ open, onClose }: Props) {
  const { trip } = useTripContext()
  const { user } = useAuth()
  const [boothId, setBoothId] = useState<string | null>(null)
  const [asking, setAsking] = useState('')
  const [discount, setDiscount] = useState('0')
  const [busy, setBusy] = useState(false)

  const askingJpy = Number(asking) || 0
  const discountPct = Number(discount) || 0
  const discountedJpy = applyDiscount(askingJpy, discountPct)

  async function save() {
    if (!user || !boothId || !askingJpy) return
    setBusy(true)
    try {
      await addDoc(itemsCol(trip.id), {
        boothId,
        formFactor: 'other',
        opalTypeTags: [],
        remark: '',

        vendorAskingJpy: askingJpy,
        discountPercent: discountPct,
        discountedJpy,
        targetBuyJpy: null,
        plannedResaleJpy: null,
        finalPaidJpy: null,

        overrideUsd: null,
        overrideHkd: null,

        status: 'spotted',
        interestStars: 3,

        photos: [],

        createdAt: serverTimestamp(),
        createdByUid: user.uid,
        updatedAt: serverTimestamp(),
        updatedByUid: user.uid,
      })
      setBoothId(null)
      setAsking('')
      setDiscount('0')
      onClose()
    } finally {
      setBusy(false)
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title="Quick add">
      <div className="space-y-3">
        <BoothPicker value={boothId} onChange={setBoothId} />
        <div className="grid grid-cols-2 gap-2">
          <Input
            label="Vendor asking"
            type="number"
            inputMode="numeric"
            value={asking}
            onChange={(e) => setAsking(e.target.value)}
            suffix="JPY"
          />
          <Input
            label="Discount"
            type="number"
            inputMode="numeric"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            suffix="%"
          />
        </div>
        {askingJpy > 0 && discountPct > 0 && (
          <div className="text-xs text-neutral-500">
            Discounted: ¥{discountedJpy.toLocaleString()}
          </div>
        )}
        <p className="text-xs text-neutral-500">
          Photos, opal type tags, target prices, remark — fill in from the item detail page after saving.
        </p>
        <Button
          className="w-full"
          onClick={save}
          disabled={busy || !boothId || !askingJpy}
        >
          {busy ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </Sheet>
  )
}
```

- [ ] **Step 4: Create `src/pages/ItemsPage.tsx`** (filters added in Task 12)

```tsx
import { useState, useMemo } from 'react'
import { useTripContext } from '../context/TripContext'
import { useItems } from '../hooks/useItems'
import { useBooths } from '../hooks/useBooths'
import { ItemCard } from '../components/items/ItemCard'
import { QuickAddSheet } from '../components/items/QuickAddSheet'
import { Button } from '../components/ui/Button'

export function ItemsPage() {
  const { trip } = useTripContext()
  const { items, loading } = useItems(trip.id)
  const { booths } = useBooths(trip.id)
  const [quickAddOpen, setQuickAddOpen] = useState(false)

  const boothMap = useMemo(
    () => new Map(booths.map((b) => [b.id, b])),
    [booths],
  )

  return (
    <div className="mx-auto max-w-md px-4 py-4">
      <div className="mb-4">
        <h1 className="text-xl font-semibold">{trip.name}</h1>
        <p className="text-xs text-neutral-500">Budget card lands in Task 11</p>
      </div>

      {loading && <div className="text-sm text-neutral-500">Loading…</div>}
      {!loading && items.length === 0 && (
        <div className="rounded-xl border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500">
          No items yet. Tap Quick add to record what you saw.
        </div>
      )}

      <div className="space-y-2">
        {items.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            trip={trip}
            booth={boothMap.get(item.boothId)}
          />
        ))}
      </div>

      <Button
        className="fixed bottom-20 left-1/2 z-10 w-[calc(100%-2rem)] max-w-md -translate-x-1/2"
        size="lg"
        onClick={() => setQuickAddOpen(true)}
      >
        ＋ Quick add
      </Button>

      <QuickAddSheet open={quickAddOpen} onClose={() => setQuickAddOpen(false)} />
    </div>
  )
}
```

- [ ] **Step 5: Wire route**

In `src/App.tsx`, replace the index route element:
```tsx
import { ItemsPage } from './pages/ItemsPage'
```
```tsx
<Route index element={<ItemsPage />} />
```

- [ ] **Step 6: Smoke test, then commit**

Add a booth, then add two items via quick-add. Confirm they appear with no photos, correct prices, correct status pill.

```bash
git add -A
git commit -m "$(cat <<'EOF'
Add items: hook, ItemsPage list, ItemCard, QuickAddSheet

QuickAddSheet creates an item with booth + asking JPY + discount %.
ItemCard shows formFactor + opal tags, booth, discounted price, HKD/USD
sub, stars, and status pill. Item detail / filters land in later tasks.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: Item detail page with all fields, status sheet, stars, tag input

**Files:**
- Create: `src/components/items/StatusPill.tsx`
- Create: `src/components/items/StarRating.tsx`
- Create: `src/components/items/OpalTagInput.tsx`
- Create: `src/pages/ItemDetailPage.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create `src/components/items/StarRating.tsx`**

```tsx
interface Props {
  value: number
  onChange?: (n: number) => void
  size?: number
}

export function StarRating({ value, onChange, size = 24 }: Props) {
  const stars = [1, 2, 3, 4, 5]
  return (
    <div className="flex items-center gap-1">
      {stars.map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange?.(n)}
          disabled={!onChange}
          aria-label={`${n} star${n === 1 ? '' : 's'}`}
          style={{ fontSize: size }}
          className={n <= value ? 'text-amber-500' : 'text-neutral-300'}
        >
          ★
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Create `src/components/items/StatusPill.tsx`**

```tsx
import { useState } from 'react'
import { updateDoc, serverTimestamp } from 'firebase/firestore'
import { clsx } from 'clsx'
import type { Item, ItemStatus } from '../../lib/types'
import { useTripContext } from '../../context/TripContext'
import { useAuth } from '../../hooks/useAuth'
import { itemDoc } from '../../lib/firestorePaths'
import { Sheet } from '../ui/Sheet'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'

interface Props { item: Item }

const styles: Record<ItemStatus, string> = {
  spotted: 'bg-indigo-50 text-indigo-700',
  bought: 'bg-emerald-50 text-emerald-700',
  passed: 'bg-neutral-100 text-neutral-500',
}
const labels: Record<ItemStatus, string> = {
  spotted: 'Spotted',
  bought: 'Bought ✓',
  passed: 'Passed',
}

export function StatusPill({ item }: Props) {
  const { trip } = useTripContext()
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [finalPaid, setFinalPaid] = useState(String(item.finalPaidJpy ?? ''))

  async function setStatus(status: ItemStatus) {
    if (!user) return
    if (status === 'bought') {
      const n = Number(finalPaid)
      if (!n || n <= 0) return
      await updateDoc(itemDoc(trip.id, item.id), {
        status: 'bought',
        finalPaidJpy: n,
        updatedAt: serverTimestamp(),
        updatedByUid: user.uid,
      })
    } else {
      await updateDoc(itemDoc(trip.id, item.id), {
        status,
        finalPaidJpy: null,
        updatedAt: serverTimestamp(),
        updatedByUid: user.uid,
      })
    }
    setOpen(false)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={clsx('rounded-full px-3 py-1 text-xs font-medium', styles[item.status])}
      >
        {labels[item.status]}
      </button>

      <Sheet open={open} onClose={() => setOpen(false)} title="Change status">
        <div className="space-y-2">
          <Button variant="secondary" className="w-full" onClick={() => setStatus('spotted')}>
            Spotted
          </Button>
          <Button variant="secondary" className="w-full" onClick={() => setStatus('passed')}>
            Passed
          </Button>
          <div className="rounded-lg border border-neutral-200 p-3">
            <Input
              label="Final paid (JPY)"
              type="number"
              inputMode="numeric"
              value={finalPaid}
              onChange={(e) => setFinalPaid(e.target.value)}
            />
            <Button
              className="mt-2 w-full"
              onClick={() => setStatus('bought')}
              disabled={!finalPaid || Number(finalPaid) <= 0}
            >
              Mark bought
            </Button>
          </div>
        </div>
      </Sheet>
    </>
  )
}
```

- [ ] **Step 3: Create `src/components/items/OpalTagInput.tsx`**

```tsx
import { useState } from 'react'
import type { KeyboardEvent } from 'react'

interface Props {
  value: string[]
  onChange: (v: string[]) => void
}

export function OpalTagInput({ value, onChange }: Props) {
  const [draft, setDraft] = useState('')

  function commit() {
    const t = draft.trim()
    if (!t) return
    if (value.includes(t)) {
      setDraft('')
      return
    }
    onChange([...value, t])
    setDraft('')
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      commit()
    } else if (e.key === 'Backspace' && !draft && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  return (
    <div>
      <span className="block text-sm font-medium text-neutral-700 mb-1">Opal types</span>
      <div className="flex flex-wrap items-center gap-1 rounded-lg border border-neutral-300 bg-white p-2">
        {value.map((t) => (
          <span
            key={t}
            className="flex items-center gap-1 rounded-full bg-neutral-900 px-2 py-0.5 text-xs text-white"
          >
            {t}
            <button
              type="button"
              onClick={() => onChange(value.filter((x) => x !== t))}
              aria-label={`remove ${t}`}
              className="text-neutral-300 hover:text-white"
            >
              ×
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKey}
          onBlur={commit}
          placeholder={value.length === 0 ? 'black, crystal, welo…' : ''}
          className="flex-1 min-w-[6rem] border-none bg-transparent text-sm outline-none"
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create `src/pages/ItemDetailPage.tsx`**

```tsx
import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  doc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'
import { useTripContext } from '../context/TripContext'
import { useBooths } from '../hooks/useBooths'
import { useAuth } from '../hooks/useAuth'
import { itemDoc } from '../lib/firestorePaths'
import { applyDiscount, formatJpy } from '../lib/currency'
import type { Item, FormFactor } from '../lib/types'
import { FORM_FACTORS, FORM_FACTOR_LABELS } from '../lib/types'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Chip } from '../components/ui/Chip'
import { BoothPicker } from '../components/booths/BoothPicker'
import { StatusPill } from '../components/items/StatusPill'
import { StarRating } from '../components/items/StarRating'
import { OpalTagInput } from '../components/items/OpalTagInput'

export function ItemDetailPage() {
  const { trip } = useTripContext()
  const { user } = useAuth()
  const { booths } = useBooths(trip.id)
  const { itemId } = useParams<{ itemId: string }>()
  const navigate = useNavigate()
  const [item, setItem] = useState<Item | null>(null)

  useEffect(() => {
    if (!itemId) return
    return onSnapshot(doc(db, 'trips', trip.id, 'items', itemId), (snap) => {
      if (!snap.exists()) {
        setItem(null)
      } else {
        setItem({ id: snap.id, ...(snap.data() as Omit<Item, 'id'>) })
      }
    })
  }, [trip.id, itemId])

  const boothMap = useMemo(() => new Map(booths.map((b) => [b.id, b])), [booths])

  if (!item) {
    return <div className="p-6 text-sm text-neutral-500">Loading…</div>
  }

  async function patch(updates: Partial<Item>) {
    if (!user || !item) return
    await updateDoc(itemDoc(trip.id, item.id), {
      ...updates,
      updatedAt: serverTimestamp(),
      updatedByUid: user.uid,
    })
  }

  async function setAskingAndDiscount(askingJpy: number, discountPercent: number) {
    await patch({
      vendorAskingJpy: askingJpy,
      discountPercent,
      discountedJpy: applyDiscount(askingJpy, discountPercent),
    })
  }

  async function remove() {
    if (!item) return
    if (!confirm('Delete this item?')) return
    await deleteDoc(itemDoc(trip.id, item.id))
    navigate(`/trips/${trip.id}`)
  }

  return (
    <div className="mx-auto max-w-md space-y-4 px-4 py-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          ← Back
        </Button>
        <StatusPill item={item} />
      </div>

      <div className="text-xs text-neutral-500">
        Photos UI in Task 10 · {item.photos.length} attached
      </div>

      <section className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4">
        <div>
          <span className="block text-sm font-medium text-neutral-700 mb-1">Form factor</span>
          <div className="flex flex-wrap gap-1">
            {FORM_FACTORS.map((f) => (
              <Chip
                key={f}
                active={item.formFactor === f}
                onClick={() => patch({ formFactor: f as FormFactor })}
              >
                {FORM_FACTOR_LABELS[f]}
              </Chip>
            ))}
          </div>
        </div>

        <OpalTagInput
          value={item.opalTypeTags}
          onChange={(opalTypeTags) => patch({ opalTypeTags })}
        />

        <Input
          label="Remark"
          value={item.remark}
          onChange={(e) => patch({ remark: e.target.value })}
        />

        <div>
          <span className="block text-sm font-medium text-neutral-700 mb-1">Booth</span>
          <BoothPicker value={item.boothId} onChange={(boothId) => patch({ boothId })} />
          {boothMap.get(item.boothId) && (
            <p className="mt-1 text-xs text-neutral-500">
              {boothMap.get(item.boothId)!.number}
              {boothMap.get(item.boothId)!.vendorName ? ` · ${boothMap.get(item.boothId)!.vendorName}` : ''}
            </p>
          )}
        </div>
      </section>

      <section className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4">
        <div className="grid grid-cols-2 gap-2">
          <Input
            label="Vendor asking"
            type="number"
            inputMode="numeric"
            value={String(item.vendorAskingJpy)}
            onChange={(e) =>
              setAskingAndDiscount(Number(e.target.value) || 0, item.discountPercent)
            }
            suffix="JPY"
          />
          <Input
            label="Discount"
            type="number"
            inputMode="numeric"
            value={String(item.discountPercent)}
            onChange={(e) =>
              setAskingAndDiscount(item.vendorAskingJpy, Number(e.target.value) || 0)
            }
            suffix="%"
          />
        </div>
        <div className="text-xs text-neutral-500">
          Discounted: <span className="font-semibold text-neutral-700">{formatJpy(item.discountedJpy)}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Input
            label="Target buy"
            type="number"
            inputMode="numeric"
            value={item.targetBuyJpy != null ? String(item.targetBuyJpy) : ''}
            onChange={(e) =>
              patch({ targetBuyJpy: e.target.value ? Number(e.target.value) : null })
            }
            suffix="JPY"
          />
          <Input
            label="Planned resale"
            type="number"
            inputMode="numeric"
            value={item.plannedResaleJpy != null ? String(item.plannedResaleJpy) : ''}
            onChange={(e) =>
              patch({ plannedResaleJpy: e.target.value ? Number(e.target.value) : null })
            }
            suffix="JPY"
          />
        </div>
      </section>

      <section className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4">
        <details>
          <summary className="cursor-pointer text-sm font-medium text-neutral-700">
            Currency overrides (optional)
          </summary>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Input
              label="USD"
              type="number"
              inputMode="decimal"
              value={item.overrideUsd != null ? String(item.overrideUsd) : ''}
              onChange={(e) =>
                patch({ overrideUsd: e.target.value ? Number(e.target.value) : null })
              }
            />
            <Input
              label="HKD"
              type="number"
              inputMode="decimal"
              value={item.overrideHkd != null ? String(item.overrideHkd) : ''}
              onChange={(e) =>
                patch({ overrideHkd: e.target.value ? Number(e.target.value) : null })
              }
            />
          </div>
        </details>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-4">
        <span className="block text-sm font-medium text-neutral-700 mb-1">Interest</span>
        <StarRating
          value={item.interestStars}
          onChange={(n) => patch({ interestStars: n })}
        />
      </section>

      <Button variant="danger" className="w-full" onClick={remove}>
        Delete item
      </Button>
    </div>
  )
}
```

- [ ] **Step 5: Wire route**

In `src/App.tsx` under `/trips/:tripId`:
```tsx
import { ItemDetailPage } from './pages/ItemDetailPage'
```
```tsx
<Route path="items/:itemId" element={<ItemDetailPage />} />
```

- [ ] **Step 6: Smoke test, then commit**

Open an existing item from the list. Edit form factor, add an opal tag, change discount %, mark bought with a final price. Reload — values persist.

```bash
git add -A
git commit -m "$(cat <<'EOF'
Add item detail page with status workflow, stars, tags

Inline-save edits to every field. StatusPill opens a sheet to switch
between spotted / bought (requires final paid) / passed. OpalTagInput
supports type-and-enter / backspace-to-pop / comma-to-commit.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: Photo upload pipeline

**Files:**
- Create: `src/hooks/useUploadPhoto.ts`
- Create: `src/components/items/PhotoUploader.tsx`
- Create: `src/components/items/PhotoGallery.tsx`
- Modify: `src/pages/ItemDetailPage.tsx`

- [ ] **Step 1: Create `src/hooks/useUploadPhoto.ts`**

```typescript
import imageCompression from 'browser-image-compression'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import {
  serverTimestamp,
  arrayUnion,
  updateDoc,
  type FieldValue,
} from 'firebase/firestore'
import { storage } from '../firebase'
import { itemDoc, itemPhotoStoragePath } from '../lib/firestorePaths'
import { useAuth } from './useAuth'
import { useState } from 'react'

interface UploadInput {
  tripId: string
  itemId: string
  files: File[]
}

interface ProgressState {
  total: number
  done: number
  current: string | null
  errors: string[]
}

export function useUploadPhoto() {
  const { user } = useAuth()
  const [progress, setProgress] = useState<ProgressState>({
    total: 0,
    done: 0,
    current: null,
    errors: [],
  })

  async function upload({ tripId, itemId, files }: UploadInput) {
    if (!user) return
    setProgress({ total: files.length, done: 0, current: null, errors: [] })
    for (const file of files) {
      setProgress((p) => ({ ...p, current: file.name }))
      try {
        const compressed = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1200,
          useWebWorker: true,
        })
        const photoId = crypto.randomUUID()
        const path = itemPhotoStoragePath(tripId, itemId, photoId)
        const sref = storageRef(storage, path)
        await uploadBytes(sref, compressed, {
          contentType: 'image/jpeg',
        })
        const { width, height } = await readDimensions(compressed)
        const photoMeta = {
          photoId,
          storagePath: path,
          thumbPath: null,
          width,
          height,
          uploadedAt: serverTimestamp() as unknown as FieldValue,
          uploadedByUid: user.uid,
        }
        await updateDoc(itemDoc(tripId, itemId), {
          photos: arrayUnion(photoMeta),
          updatedAt: serverTimestamp(),
          updatedByUid: user.uid,
        })
        setProgress((p) => ({ ...p, done: p.done + 1 }))
      } catch (err) {
        setProgress((p) => ({
          ...p,
          errors: [...p.errors, `${file.name}: ${(err as Error).message}`],
          done: p.done + 1,
        }))
      }
    }
    setProgress((p) => ({ ...p, current: null }))
  }

  async function getUrl(storagePath: string): Promise<string> {
    return getDownloadURL(storageRef(storage, storagePath))
  }

  return { upload, getUrl, progress }
}

function readDimensions(blob: Blob): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
      URL.revokeObjectURL(img.src)
    }
    img.onerror = () => {
      resolve({ width: 0, height: 0 })
      URL.revokeObjectURL(img.src)
    }
    img.src = URL.createObjectURL(blob)
  })
}
```

- [ ] **Step 2: Create `src/components/items/PhotoUploader.tsx`**

```tsx
import { useRef } from 'react'
import type { ChangeEvent } from 'react'
import { useUploadPhoto } from '../../hooks/useUploadPhoto'
import { Button } from '../ui/Button'

interface Props {
  tripId: string
  itemId: string
  remainingSlots: number
}

export function PhotoUploader({ tripId, itemId, remainingSlots }: Props) {
  const ref = useRef<HTMLInputElement>(null)
  const { upload, progress } = useUploadPhoto()

  async function onChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, remainingSlots)
    e.target.value = ''
    if (files.length === 0) return
    await upload({ tripId, itemId, files })
  }

  const busy = progress.current != null

  return (
    <div>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        multiple
        onChange={onChange}
        className="hidden"
      />
      <Button
        variant="secondary"
        size="sm"
        disabled={busy || remainingSlots <= 0}
        onClick={() => ref.current?.click()}
      >
        {busy ? `Uploading… ${progress.done}/${progress.total}` : `＋ Add photo (${remainingSlots} left)`}
      </Button>
      {progress.errors.length > 0 && (
        <div className="mt-1 text-xs text-red-600">
          {progress.errors.map((e, i) => (
            <div key={i}>{e}</div>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Create `src/components/items/PhotoGallery.tsx`**

```tsx
import { useEffect, useState } from 'react'
import { ref as storageRef, deleteObject } from 'firebase/storage'
import { arrayRemove, serverTimestamp, updateDoc } from 'firebase/firestore'
import { storage } from '../../firebase'
import { itemDoc } from '../../lib/firestorePaths'
import type { Photo } from '../../lib/types'
import { useUploadPhoto } from '../../hooks/useUploadPhoto'
import { useAuth } from '../../hooks/useAuth'

interface Props {
  tripId: string
  itemId: string
  photos: Photo[]
}

export function PhotoGallery({ tripId, itemId, photos }: Props) {
  const { user } = useAuth()
  const { getUrl } = useUploadPhoto()
  const [urls, setUrls] = useState<Record<string, string>>({})

  useEffect(() => {
    let cancelled = false
    async function load() {
      const map: Record<string, string> = {}
      for (const p of photos) {
        if (urls[p.photoId]) {
          map[p.photoId] = urls[p.photoId]
          continue
        }
        map[p.photoId] = await getUrl(p.storagePath)
      }
      if (!cancelled) setUrls(map)
    }
    load()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photos.map((p) => p.photoId).join(',')])

  async function remove(p: Photo) {
    if (!user) return
    if (!confirm('Delete this photo?')) return
    try {
      await deleteObject(storageRef(storage, p.storagePath))
    } catch {
      /* ignore — doc removal still proceeds */
    }
    await updateDoc(itemDoc(tripId, itemId), {
      photos: arrayRemove(p),
      updatedAt: serverTimestamp(),
      updatedByUid: user.uid,
    })
  }

  if (photos.length === 0) {
    return <p className="text-xs text-neutral-500">No photos yet.</p>
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {photos.map((p) => (
        <div key={p.photoId} className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100">
          {urls[p.photoId] && (
            <img src={urls[p.photoId]} alt="" className="h-full w-full object-cover" />
          )}
          <button
            type="button"
            onClick={() => remove(p)}
            className="absolute right-1 top-1 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Wire into `src/pages/ItemDetailPage.tsx`**

Add imports near the top:
```tsx
import { PhotoUploader } from '../components/items/PhotoUploader'
import { PhotoGallery } from '../components/items/PhotoGallery'
```

Replace the old `<div className="text-xs text-neutral-500">Photos UI in Task 10 …</div>` block with:

```tsx
<section className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4">
  <div className="flex items-center justify-between">
    <span className="text-sm font-medium text-neutral-700">Photos</span>
    <PhotoUploader
      tripId={trip.id}
      itemId={item.id}
      remainingSlots={Math.max(0, 5 - item.photos.length)}
    />
  </div>
  <PhotoGallery tripId={trip.id} itemId={item.id} photos={item.photos} />
</section>
```

- [ ] **Step 5: Update `ItemCard.tsx` to use the same `getDownloadURL` flow**

Currently `ItemCard` uses a hand-rolled URL pattern that requires the storage bucket name from `import.meta.env`. For correctness and security-rule compatibility, change it to fetch the URL via `getDownloadURL`. Replace the thumbnail block in `src/components/items/ItemCard.tsx` so cover URL is loaded lazily:

```tsx
// near top, replace the existing <div className="h-16 w-16…"> block with this:
<ItemThumb photo={item.photos[0]} />
```

Add this component at the bottom of the same file:

```tsx
import { useEffect, useState } from 'react'
import { ref as storageRef, getDownloadURL } from 'firebase/storage'
import { storage } from '../../firebase'
import type { Photo } from '../../lib/types'

function ItemThumb({ photo }: { photo: Photo | undefined }) {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    if (!photo) return
    let cancelled = false
    getDownloadURL(storageRef(storage, photo.storagePath))
      .then((u) => {
        if (!cancelled) setUrl(u)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [photo?.storagePath])
  return (
    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-100">
      {url && <img src={url} alt="" className="h-full w-full object-cover" loading="lazy" />}
    </div>
  )
}
```

And remove the original `<div className="h-16 w-16…">` block (the one that built a raw firebasestorage URL).

- [ ] **Step 6: Smoke test, then commit**

Open an item, upload 2 photos from the file picker. Confirm they appear in the gallery and show as the cover on the items list. Delete one; the gallery and cover update.

```bash
git add -A
git commit -m "$(cat <<'EOF'
Add photo upload pipeline

useUploadPhoto compresses each file to ≤1MB / 1200px via
browser-image-compression, uploads to Storage, and arrayUnion-patches
the item's photos. PhotoGallery renders thumbnails via getDownloadURL.
ItemCard cover now uses getDownloadURL too.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 11: Budget card, rate editor, budget-adjust sheet (HKD helper)

**Files:**
- Create: `src/components/budget/BudgetCard.tsx`
- Create: `src/components/budget/BudgetAdjustSheet.tsx`
- Create: `src/components/budget/RateEditor.tsx`
- Modify: `src/pages/ItemsPage.tsx`
- Modify: `src/pages/SettingsPage.tsx`

- [ ] **Step 1: Create `src/components/budget/BudgetCard.tsx`**

```tsx
import { useMemo } from 'react'
import type { Trip, Item } from '../../lib/types'
import {
  budgetRemaining,
  jpyToUsd,
  jpyToHkd,
  formatJpy,
  formatUsd,
  formatHkd,
} from '../../lib/currency'

interface Props { trip: Trip; items: Item[] }

export function BudgetCard({ trip, items }: Props) {
  const { remaining, spent, pct } = useMemo(() => {
    const r = budgetRemaining(trip.budgetJpy, items)
    const s = trip.budgetJpy - r
    const p = trip.budgetJpy > 0 ? Math.max(0, Math.min(100, (s / trip.budgetJpy) * 100)) : 0
    return { remaining: r, spent: s, pct: p }
  }, [trip.budgetJpy, items])

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="flex items-baseline justify-between">
        <span className="text-xs text-neutral-500">Budget remaining</span>
        <span className="text-xs text-neutral-500">{formatJpy(trip.budgetJpy)} set</span>
      </div>
      <div className="mt-1 text-2xl font-bold tracking-tight">{formatJpy(remaining)}</div>
      <div className="text-xs text-neutral-500">
        ≈ {formatHkd(jpyToHkd(remaining, trip.rates.jpyToHkd))} · {formatUsd(jpyToUsd(remaining, trip.rates.jpyToUsd))}
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-200">
        <div className="h-full bg-blue-600" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-1 text-xs text-neutral-500">
        Spent {formatJpy(spent)} of {formatJpy(trip.budgetJpy)} ({pct.toFixed(0)}%)
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `src/components/budget/BudgetAdjustSheet.tsx`**

```tsx
import { useState } from 'react'
import { increment, serverTimestamp, updateDoc } from 'firebase/firestore'
import { tripDoc } from '../../lib/firestorePaths'
import { hkdToJpy } from '../../lib/currency'
import type { Trip } from '../../lib/types'
import { Sheet } from '../ui/Sheet'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'

interface Props {
  trip: Trip
  open: boolean
  onClose: () => void
}

type Mode = 'add-hkd' | 'add-jpy' | 'set-jpy'

export function BudgetAdjustSheet({ trip, open, onClose }: Props) {
  const [mode, setMode] = useState<Mode>('add-hkd')
  const [amount, setAmount] = useState('')
  const [busy, setBusy] = useState(false)
  const n = Number(amount) || 0

  const previewJpy =
    mode === 'add-hkd'
      ? hkdToJpy(n, trip.rates.jpyToHkd)
      : n

  async function apply() {
    if (!n) return
    setBusy(true)
    try {
      const delta = mode === 'add-hkd' || mode === 'add-jpy' ? previewJpy : null
      if (mode === 'set-jpy') {
        await updateDoc(tripDoc(trip.id), {
          budgetJpy: n,
          updatedAt: serverTimestamp(),
        })
      } else if (delta != null) {
        await updateDoc(tripDoc(trip.id), {
          budgetJpy: increment(delta),
          updatedAt: serverTimestamp(),
        })
      }
      setAmount('')
      onClose()
    } finally {
      setBusy(false)
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title="Adjust budget">
      <div className="space-y-3">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={mode === 'add-hkd' ? 'primary' : 'secondary'}
            onClick={() => setMode('add-hkd')}
          >
            + HKD
          </Button>
          <Button
            size="sm"
            variant={mode === 'add-jpy' ? 'primary' : 'secondary'}
            onClick={() => setMode('add-jpy')}
          >
            + JPY
          </Button>
          <Button
            size="sm"
            variant={mode === 'set-jpy' ? 'primary' : 'secondary'}
            onClick={() => setMode('set-jpy')}
          >
            Set JPY
          </Button>
        </div>
        <Input
          type="number"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          suffix={mode === 'add-hkd' ? 'HKD' : 'JPY'}
          placeholder="Negative to subtract"
        />
        {mode === 'add-hkd' && n !== 0 && (
          <p className="text-xs text-neutral-500">
            = {previewJpy.toLocaleString()} JPY at rate {trip.rates.jpyToHkd}
          </p>
        )}
        <Button onClick={apply} disabled={busy || !n} className="w-full">
          {busy ? 'Saving…' : 'Apply'}
        </Button>
      </div>
    </Sheet>
  )
}
```

- [ ] **Step 3: Create `src/components/budget/RateEditor.tsx`**

```tsx
import { useState } from 'react'
import { serverTimestamp, updateDoc } from 'firebase/firestore'
import { tripDoc } from '../../lib/firestorePaths'
import type { Trip } from '../../lib/types'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'

export function RateEditor({ trip }: { trip: Trip }) {
  const [usd, setUsd] = useState(String(trip.rates.jpyToUsd))
  const [hkd, setHkd] = useState(String(trip.rates.jpyToHkd))
  const [busy, setBusy] = useState(false)

  async function save() {
    const u = Number(usd) || 0
    const h = Number(hkd) || 0
    if (u <= 0 || h <= 0) return
    setBusy(true)
    try {
      await updateDoc(tripDoc(trip.id), {
        rates: {
          jpyToUsd: u,
          jpyToHkd: h,
          updatedAt: serverTimestamp(),
        },
        updatedAt: serverTimestamp(),
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-3">
      <Input
        label="JPY → USD"
        type="number"
        inputMode="decimal"
        value={usd}
        onChange={(e) => setUsd(e.target.value)}
      />
      <Input
        label="JPY → HKD"
        type="number"
        inputMode="decimal"
        value={hkd}
        onChange={(e) => setHkd(e.target.value)}
      />
      <Button onClick={save} disabled={busy}>
        {busy ? 'Saving…' : 'Save rates'}
      </Button>
    </div>
  )
}
```

- [ ] **Step 4: Wire BudgetCard into ItemsPage**

In `src/pages/ItemsPage.tsx`, replace the line `<p className="text-xs text-neutral-500">Budget card lands in Task 11</p>` with:

```tsx
import { BudgetCard } from '../components/budget/BudgetCard'
```
```tsx
<BudgetCard trip={trip} items={items} />
```

- [ ] **Step 5: Wire budget + rates into SettingsPage**

Replace the placeholder budget section in `src/pages/SettingsPage.tsx` with:

```tsx
import { useState } from 'react'                       // already imported
import { BudgetAdjustSheet } from '../components/budget/BudgetAdjustSheet'
import { RateEditor } from '../components/budget/RateEditor'
```

```tsx
const [budgetOpen, setBudgetOpen] = useState(false)
```

Replace `<section className="space-y-2 rounded-xl border border-neutral-200 bg-white p-4">…Budget &amp; rates…Added in Task 11.…</section>` with:

```tsx
<section className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4">
  <div className="text-sm font-medium">Budget</div>
  <div className="text-xs text-neutral-500">Current: ¥{trip.budgetJpy.toLocaleString()}</div>
  <Button variant="secondary" onClick={() => setBudgetOpen(true)}>Adjust budget</Button>
</section>

<section className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4">
  <div className="text-sm font-medium">Conversion rates</div>
  <RateEditor trip={trip} />
</section>

<BudgetAdjustSheet trip={trip} open={budgetOpen} onClose={() => setBudgetOpen(false)} />
```

- [ ] **Step 6: Smoke test, then commit**

Set rates to your trip's actual ones. Adjust budget via "+HKD" — observe JPY math. Items bought subtract from remaining.

```bash
git add -A
git commit -m "$(cat <<'EOF'
Add budget card, rate editor, and budget adjust (HKD helper)

BudgetCard shows JPY remaining + HKD/USD sub + progress bar.
BudgetAdjustSheet supports +HKD (converts at current rate), +JPY,
and set-JPY modes. RateEditor lives in trip Settings.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 12: Filters and search on ItemsPage, offline banner

**Files:**
- Create: `src/components/layout/OfflineBanner.tsx`
- Modify: `src/pages/ItemsPage.tsx`
- Modify: `src/components/layout/TripLayout.tsx`

- [ ] **Step 1: Create `src/components/layout/OfflineBanner.tsx`**

```tsx
import { useEffect, useState } from 'react'

export function OfflineBanner() {
  const [online, setOnline] = useState(navigator.onLine)
  useEffect(() => {
    function on() { setOnline(true) }
    function off() { setOnline(false) }
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])
  if (online) return null
  return (
    <div className="bg-amber-100 px-3 py-2 text-center text-xs text-amber-800">
      You're offline. Connect to wifi to save new changes.
    </div>
  )
}
```

- [ ] **Step 2: Add OfflineBanner to TripLayout**

In `src/components/layout/TripLayout.tsx`, import and render at the top of the main column:

```tsx
import { OfflineBanner } from './OfflineBanner'
```

Replace `<main className="flex-1 pb-2">` block with:
```tsx
<OfflineBanner />
<main className="flex-1 pb-2">
  <Outlet />
</main>
```

- [ ] **Step 3: Add filters + search to ItemsPage**

Replace the body of `src/pages/ItemsPage.tsx` with:

```tsx
import { useMemo, useState } from 'react'
import { useTripContext } from '../context/TripContext'
import { useItems } from '../hooks/useItems'
import { useBooths } from '../hooks/useBooths'
import { ItemCard } from '../components/items/ItemCard'
import { QuickAddSheet } from '../components/items/QuickAddSheet'
import { Button } from '../components/ui/Button'
import { Chip } from '../components/ui/Chip'
import { Input } from '../components/ui/Input'
import { BudgetCard } from '../components/budget/BudgetCard'
import { filterItems } from '../lib/search'
import type { ItemStatus } from '../lib/types'

type StatusFilter = 'all' | ItemStatus

export function ItemsPage() {
  const { trip } = useTripContext()
  const { items, loading } = useItems(trip.id)
  const { booths } = useBooths(trip.id)
  const [quickAddOpen, setQuickAddOpen] = useState(false)

  const [status, setStatus] = useState<StatusFilter>('all')
  const [minStars, setMinStars] = useState<0 | 4>(0)
  const [query, setQuery] = useState('')

  const boothMap = useMemo(
    () => new Map(booths.map((b) => [b.id, b])),
    [booths],
  )

  const filtered = useMemo(
    () => filterItems(items, { status, minStars, query }),
    [items, status, minStars, query],
  )

  return (
    <div className="mx-auto max-w-md px-4 py-4">
      <div className="mb-3">
        <h1 className="text-xl font-semibold">{trip.name}</h1>
      </div>

      <BudgetCard trip={trip} items={items} />

      <div className="mt-3 flex gap-2 overflow-x-auto py-1">
        <Chip active={status === 'all'} onClick={() => setStatus('all')}>All</Chip>
        <Chip active={status === 'spotted'} onClick={() => setStatus('spotted')}>Spotted</Chip>
        <Chip active={status === 'bought'} onClick={() => setStatus('bought')}>Bought</Chip>
        <Chip active={status === 'passed'} onClick={() => setStatus('passed')}>Passed</Chip>
        <Chip active={minStars === 4} onClick={() => setMinStars(minStars === 4 ? 0 : 4)}>
          ★ 4+
        </Chip>
      </div>

      <div className="my-3">
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search remark…"
        />
      </div>

      {loading && <div className="text-sm text-neutral-500">Loading…</div>}
      {!loading && filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500">
          {items.length === 0
            ? 'No items yet. Tap Quick add to record what you saw.'
            : 'No items match the current filters.'}
        </div>
      )}

      <div className="space-y-2">
        {filtered.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            trip={trip}
            booth={boothMap.get(item.boothId)}
          />
        ))}
      </div>

      <Button
        className="fixed bottom-20 left-1/2 z-10 w-[calc(100%-2rem)] max-w-md -translate-x-1/2"
        size="lg"
        onClick={() => setQuickAddOpen(true)}
      >
        ＋ Quick add
      </Button>

      <QuickAddSheet open={quickAddOpen} onClose={() => setQuickAddOpen(false)} />
    </div>
  )
}
```

- [ ] **Step 4: Smoke test, then commit**

Toggle status filters, search by remark, toggle airplane mode and confirm the offline banner.

```bash
git add -A
git commit -m "$(cat <<'EOF'
Add filters, remark search, and offline banner

Status / 4+ stars / remark substring filter on items list.
Offline banner appears in TripLayout when navigator goes offline.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 13: Booth detail page

**Files:**
- Create: `src/pages/BoothDetailPage.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create `src/pages/BoothDetailPage.tsx`**

```tsx
import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTripContext } from '../context/TripContext'
import { useItems } from '../hooks/useItems'
import { useBooths } from '../hooks/useBooths'
import { ItemCard } from '../components/items/ItemCard'
import { Button } from '../components/ui/Button'

export function BoothDetailPage() {
  const { trip } = useTripContext()
  const { boothId } = useParams<{ boothId: string }>()
  const { items } = useItems(trip.id)
  const { booths } = useBooths(trip.id)
  const navigate = useNavigate()

  const booth = booths.find((b) => b.id === boothId)
  const boothMap = useMemo(() => new Map(booths.map((b) => [b.id, b])), [booths])
  const boothItems = useMemo(
    () => items.filter((i) => i.boothId === boothId),
    [items, boothId],
  )

  if (!booth) {
    return (
      <div className="p-6 text-sm text-neutral-500">
        Booth not found. <Button variant="ghost" onClick={() => navigate(-1)}>Back</Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md space-y-3 px-4 py-4">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>← Back</Button>
      <div>
        <h1 className="text-xl font-semibold">{booth.number}</h1>
        {booth.vendorName && (
          <p className="text-sm text-neutral-600">{booth.vendorName}</p>
        )}
        {booth.note && <p className="text-xs text-neutral-500">{booth.note}</p>}
        <p className="mt-1 text-xs text-neutral-500">{boothItems.length} item(s) recorded</p>
      </div>

      <div className="space-y-2">
        {boothItems.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            trip={trip}
            booth={boothMap.get(item.boothId)}
          />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Wire route**

In `src/App.tsx` replace the booth-detail placeholder:
```tsx
import { BoothDetailPage } from './pages/BoothDetailPage'
```
```tsx
<Route path="booths/:boothId" element={<BoothDetailPage />} />
```

- [ ] **Step 3: Smoke test, then commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
Add booth detail page

Shows the booth's number/vendor/note plus the list of items at that
booth. Reaches into the same ItemCard component.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 14: Collaborators on Settings page

**Files:**
- Modify: `src/pages/SettingsPage.tsx`

- [ ] **Step 1: Replace the members section with an invite UI**

In `src/pages/SettingsPage.tsx`, replace the `<section>` containing "Members" and "Invite UI added in Task 14." with:

```tsx
import { getDocs, query, where, arrayUnion } from 'firebase/firestore'
import { usersCol } from '../lib/firestorePaths'
```

```tsx
const [inviteEmail, setInviteEmail] = useState('')
const [inviting, setInviting] = useState(false)
const [inviteError, setInviteError] = useState<string | null>(null)

async function invite() {
  setInviteError(null)
  setInviting(true)
  try {
    const q = query(usersCol(), where('email', '==', inviteEmail.trim().toLowerCase()))
    const snap = await getDocs(q)
    if (snap.empty) {
      setInviteError(
        'No matching user. They must sign in once before you can add them.',
      )
      return
    }
    const uid = snap.docs[0].id
    if (uid === trip.ownerUid || trip.collaboratorUids.includes(uid)) {
      setInviteError('Already a member.')
      return
    }
    await updateDoc(tripDoc(trip.id), {
      collaboratorUids: arrayUnion(uid),
      updatedAt: serverTimestamp(),
    })
    setInviteEmail('')
  } finally {
    setInviting(false)
  }
}

async function removeCollaborator(uid: string) {
  if (!confirm('Remove this collaborator?')) return
  await updateDoc(tripDoc(trip.id), {
    collaboratorUids: arrayRemove(uid),
    updatedAt: serverTimestamp(),
  })
}
```

And the JSX block (replaces the old `<section>` for Members):
```tsx
<section className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4">
  <div className="text-sm font-medium">Members</div>
  <div className="text-xs text-neutral-600">
    Owner: {trip.ownerUid === user?.uid ? 'you' : trip.ownerUid}
  </div>
  <div className="space-y-1">
    {trip.collaboratorUids.length === 0 && (
      <p className="text-xs text-neutral-500">No collaborators yet.</p>
    )}
    {trip.collaboratorUids.map((uid) => (
      <div key={uid} className="flex items-center justify-between text-xs">
        <span>{uid}</span>
        {isOwner && (
          <Button variant="ghost" size="sm" onClick={() => removeCollaborator(uid)}>
            Remove
          </Button>
        )}
      </div>
    ))}
  </div>
  {isOwner && (
    <div className="space-y-2 pt-2">
      <Input
        label="Invite by email"
        type="email"
        value={inviteEmail}
        onChange={(e) => setInviteEmail(e.target.value)}
        placeholder="partner@example.com"
      />
      {inviteError && <p className="text-xs text-red-600">{inviteError}</p>}
      <Button onClick={invite} disabled={inviting || !inviteEmail.trim()}>
        {inviting ? 'Adding…' : 'Add collaborator'}
      </Button>
    </div>
  )}
</section>
```

- [ ] **Step 2: Smoke test, then commit**

Sign in on a second Google account on another browser/incognito to create that user's `/users/{uid}`. Then back in the owner session, invite the second email. The second account should see the trip in the picker on reload.

```bash
git add -A
git commit -m "$(cat <<'EOF'
Add collaborator invite/remove on Settings

Owner enters a gmail; we look up the user by email in /users and
push to collaboratorUids. Collaborator must have signed in once.
Owners can also remove existing collaborators.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 15: Firestore + Storage security rules + indexes

**Files:**
- Rewrite: `firestore.rules`
- Rewrite: `storage.rules`
- Rewrite: `firestore.indexes.json`

- [ ] **Step 1: Replace `firestore.rules`**

```
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {

    function signedIn() {
      return request.auth != null;
    }

    function isMember(tripData) {
      return signedIn() && (
        tripData.ownerUid == request.auth.uid ||
        request.auth.uid in tripData.collaboratorUids
      );
    }

    match /users/{uid} {
      allow read: if signedIn();
      allow write: if signedIn() && request.auth.uid == uid;
    }

    match /trips/{tripId} {
      allow read: if isMember(resource.data);
      allow create: if signedIn()
        && request.resource.data.ownerUid == request.auth.uid;
      allow update: if isMember(resource.data)
        && request.resource.data.ownerUid == resource.data.ownerUid;
      allow delete: if signedIn()
        && resource.data.ownerUid == request.auth.uid;

      match /booths/{boothId} {
        allow read, write: if isMember(get(
          /databases/$(db)/documents/trips/$(tripId)
        ).data);
      }

      match /items/{itemId} {
        allow read, write: if isMember(get(
          /databases/$(db)/documents/trips/$(tripId)
        ).data);
      }
    }
  }
}
```

- [ ] **Step 2: Replace `storage.rules`**

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /trips/{tripId}/items/{itemId}/{file=**} {
      function tripData() {
        return firestore.get(
          /databases/(default)/documents/trips/$(tripId)
        ).data;
      }
      allow read, write: if request.auth != null && (
        tripData().ownerUid == request.auth.uid ||
        tripData().collaboratorUids.hasAny([request.auth.uid])
      );
    }
  }
}
```

- [ ] **Step 3: Replace `firestore.indexes.json`**

```json
{
  "indexes": [
    {
      "collectionGroup": "items",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "updatedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "items",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "boothId", "order": "ASCENDING" },
        { "fieldPath": "updatedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "trips",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "ownerUid", "order": "ASCENDING" },
        { "fieldPath": "updatedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "trips",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "collaboratorUids", "arrayConfig": "CONTAINS" },
        { "fieldPath": "updatedAt", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

- [ ] **Step 4: Deploy rules + indexes**

Run:
```bash
npx firebase deploy --only firestore:rules,firestore:indexes,storage
```
(If `firebase-tools` is not globally installed, the `npx firebase` will fetch it; you'll need to be logged in via `npx firebase login` first.)

Expected: rules deployed; indexes may show as "building" — that's OK, queries will work once they finish.

- [ ] **Step 5: Smoke test, then commit**

Open the app in the second account's browser. Try to read a trip you weren't invited to (it should fail). Make sure your own trips still work.

```bash
git add firestore.rules storage.rules firestore.indexes.json
git commit -m "$(cat <<'EOF'
Tighten Firestore and Storage rules; add indexes

Trips and subcollections readable/writable only by owner or
collaborators. Storage mirrors via firestore.get(). Adds indexes for
items(status, updatedAt) and items(boothId, updatedAt), plus
trips(ownerUid) and trips(collaboratorUids).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 16: Deploy + manual UAT

- [ ] **Step 1: Build and deploy**

Run:
```bash
npm run build
npx firebase deploy --only hosting
```

Expected: a hosting URL like `https://my-opal-challenge.web.app` is printed. Open it on both phones.

- [ ] **Step 2: UAT checklist (run through on both phones)**

- [ ] Owner signs in on phone A; collaborator signs in on phone B (must sign in at least once to create `/users` doc).
- [ ] Owner creates "Kobe Show — May 2026" trip with budget ¥300,000 (via "+HKD" helper: enter HKD amount, confirm JPY math).
- [ ] Owner invites collaborator's email on Settings → Members.
- [ ] Phone B sees the trip in picker on next pull.
- [ ] On phone A, add 2 booths; phone B sees them within a second.
- [ ] On phone A quick-add an item with photo + booth + asking price + discount; phone B sees it.
- [ ] On phone B edit the item (add opal tags, change stars); phone A sees the update.
- [ ] Mark item "Bought" with a final price on either phone; budget remaining drops on both.
- [ ] Adjust budget via "+HKD" helper on phone B; remaining updates everywhere.
- [ ] Toggle airplane mode on phone A; offline banner appears; reconnect; reads resume.
- [ ] Filter the items list by "★ 4+" then by "Bought"; search by partial remark.
- [ ] Visit a booth detail; only items from that booth appear.
- [ ] Owner removes collaborator on Settings; phone B loses access on next listener event.

- [ ] **Step 3: Commit the build artifact metadata (no app code changes)**

Nothing to commit here unless `firebase.json` or `firebase-debug.log` changed. Skip if no diff.

---

## Self-Review

**1. Spec coverage**

| Spec section | Implementing task(s) |
|---|---|
| Auth (Google) | Task 4 |
| Data model: trips, booths, items | Task 5, 7, 8, 9 |
| Photo schema + Storage layout | Task 10 |
| Discount math | Task 2 (math), Task 8 + 9 (apply on save) |
| Currency conversion + budget | Task 2 (math), Task 11 (UI) |
| Status workflow | Task 9 |
| Interest stars | Task 9 |
| Form factor | Task 1 (types), Task 9 (UI) |
| Opal type freeform tags | Task 9 |
| Remark + client-side substring search | Task 3, Task 12 |
| Booth as first-class entity | Task 7 |
| Booth detail | Task 13 |
| Trip picker + multi-trip | Task 5 |
| Quick-add | Task 8 |
| Item detail full form | Task 9 + Task 11 (overrides shown via per-item) |
| Currency overrides per item | Task 9 |
| Budget HKD helper | Task 11 |
| Rate editor | Task 11 |
| Online-only banner | Task 12 |
| Collaborator invite/remove | Task 14 |
| Firestore + Storage rules | Task 15 |
| Indexes | Task 15 |
| UAT | Task 16 |

All spec sections covered. ✓

**2. Placeholder scan**

Scanned for "TBD", "TODO", "fill in", "handle edge cases", "similar to". None found except:
- Two "lands in later tasks" notes inside Task 6 / Task 8 placeholder text — those are intentional, point at the correct later task, and are replaced in that later task.

**3. Type consistency check**

- `Trip.rates` shape matches between `types.ts`, `currency.test.ts`, `TripPickerPage` create, `RateEditor`, `BudgetCard`.
- `Item.photos` is `Photo[]` throughout; `Photo` shape matches `useUploadPhoto` insertion + `PhotoGallery` removal.
- `itemDoc(tripId, itemId)` signature used consistently.
- `applyDiscount`, `effectiveItemJpy`, `budgetRemaining` signatures used consistently in `QuickAddSheet`, `ItemDetailPage`, `ItemCard`, `BudgetCard`.

No type drift. ✓
