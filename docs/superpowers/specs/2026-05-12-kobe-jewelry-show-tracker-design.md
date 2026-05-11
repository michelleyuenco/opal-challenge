# Kobe Opal Show Tracker — Design

**Date:** 2026-05-12
**Status:** Draft, pending review

## Purpose

A two-phone, real-time-shared web app for tracking potential opal and vintage opal-jewelry purchases at jewelry shows (first use: Kobe show, May 2026). Lets the user record what they saw at which booth — with photos, opal types, multiple price points (vendor asking, post-discount, target, planned resale, final paid), and an interest rating — so they can walk past, deliberate, and decide on a return pass. Tracks a shared trip budget in JPY with HKD/USD displays.

## Non-goals

- Offline-first writes. The app is online-only with a clear "you are offline" warning.
- Custom auth. Google sign-in only.
- Advanced full-text or fuzzy search. Partial prefix match on a normalized remark is enough.
- A native mobile app. PWA-friendly responsive web app run from a phone browser.
- Server-side logic / Cloud Functions. All access control via Firestore + Storage rules.

## High-level architecture

- **Frontend:** React 19 + TypeScript + Tailwind, Vite dev/build.
- **Data:** Firestore (real-time `onSnapshot` listeners), Firebase Storage (photos), Firebase Auth (Google provider).
- **State:** Custom hooks wrapping Firestore listeners. React Context for current-trip-id. React Hook Form for forms. No global state library.
- **Routing:** `react-router-dom` with a flat route table.
- **Photo pipeline:** `browser-image-compression` for client-side compression before upload.

## Data model

### Firestore

```
/users/{uid}
  email: string
  displayName: string
  photoURL: string
  createdAt: Timestamp

/trips/{tripId}
  name: string                              "Kobe Jewelry Show — May 2026"
  startDate: Timestamp | null
  endDate: Timestamp | null
  ownerUid: string
  collaboratorUids: string[]
  budgetJpy: number                         canonical budget in yen
  rates: {
    jpyToUsd: number                        e.g. 0.00657
    jpyToHkd: number                        e.g. 0.0509
    updatedAt: Timestamp
  }
  createdAt: Timestamp
  updatedAt: Timestamp

/trips/{tripId}/booths/{boothId}
  number: string                            "C-15"
  vendorName: string                        "Yamamoto Gem"
  note: string
  createdAt: Timestamp
  createdByUid: string

/trips/{tripId}/items/{itemId}
  boothId: string                           FK to /trips/{tripId}/booths/{boothId}
  formFactor: "loose-stone" | "ring" | "pendant" | "earrings" |
              "necklace" | "brooch" | "bracelet" | "other"
  opalTypeTags: string[]                    freeform user tags

  remark: string

  vendorAskingJpy: number                   sticker / pre-discount asking price
  discountPercent: number                   0..100, may be 0
  discountedJpy: number                     stored = round(asking × (1 − discount/100))
  targetBuyJpy: number | null
  plannedResaleJpy: number | null
  finalPaidJpy: number | null               required iff status === "bought"

  overrideUsd: number | null                if set, replaces auto-conversion for display
  overrideHkd: number | null

  status: "spotted" | "bought" | "passed"
  interestStars: number                     1..5

  photos: Array<{
    photoId: string                         uuid
    storagePath: string                     "trips/{tripId}/items/{itemId}/{photoId}.jpg"
    thumbPath: string | null                "trips/{tripId}/items/{itemId}/{photoId}-thumb.jpg"
    width: number
    height: number
    uploadedAt: Timestamp
    uploadedByUid: string
  }>

  createdAt: Timestamp
  createdByUid: string
  updatedAt: Timestamp
  updatedByUid: string
```

### Firebase Storage layout

```
trips/{tripId}/items/{itemId}/{photoId}.jpg          full-size compressed
trips/{tripId}/items/{itemId}/{photoId}-thumb.jpg    optional 200px thumb
```

### Indexes

- Composite: `/trips/{tripId}/items` on `(status, updatedAt desc)` for the default list view.
- Composite: `/trips/{tripId}/items` on `(boothId, updatedAt desc)` for the booth-detail view.

Remark search is performed client-side as case-insensitive substring match against the already-loaded item list (trips of ~50–200 items make this trivially fast). No remark index needed.

## Currency, budget, and discount math

All math is centralized in `src/lib/currency.ts`.

- **Discounted price** is stored, not just derived. Recomputed on every item write so list views and queries can use it directly:
  `discountedJpy = Math.round(vendorAskingJpy × (1 − discountPercent / 100))`
- **JPY → USD / HKD** for display: if `overrideUsd` (or `overrideHkd`) is set on the item, use it; otherwise `usd = jpy × trip.rates.jpyToUsd`, same for HKD.
- **Effective price for comparison and budget** is `finalPaidJpy` if the item is `bought`, else `discountedJpy`. This is what the budget remaining calculation uses for bought items.
- **Spent total:** sum of `finalPaidJpy` across items where `status === "bought"`.
- **Remaining:** `budgetJpy − spent`. Displayed in JPY headline plus HKD/USD subtitle via current rates.
- **Budget HKD helper:** Settings has an "Add to budget" input that takes HKD. The app converts at the current `jpyToHkd` rate (`jpy = round(hkd / jpyToHkd)`) and adds to `budgetJpy`. The conversion is performed at the moment of the adjustment; subsequent rate edits do not retro-adjust prior budget changes. The same helper supports negative HKD (subtract from budget) and "set to" mode.
- **Rates are stored on the trip doc** (not global), so each trip can have its own rates. Changing rates instantly updates derived USD/HKD displays everywhere but never touches stored JPY values.

## Status workflow

- `spotted` (default on create) — interest rating 1–5 stars; appears in default list.
- `bought` — requires `finalPaidJpy`. Item moves into the "Bought" filter and is included in spent total.
- `passed` — terminal but reversible. Hidden by default in the list; surfaced via the "Passed" filter.

Tapping the status pill on an item card opens a sheet to change status. Moving to `bought` requires typing `finalPaidJpy`. Moving away from `bought` clears `finalPaidJpy` after confirmation.

## Screens and navigation

Route table (react-router):

| Path | Page | Notes |
|---|---|---|
| `/login` | `SignInPage` | "Continue with Google" |
| `/` | `TripPickerPage` | Lists owned + collaborated trips; create / open |
| `/trips/:tripId` | `ItemsPage` | Default trip view (main screen) |
| `/trips/:tripId/items/:itemId` | `ItemDetailPage` | Full item form |
| `/trips/:tripId/booths` | `BoothsPage` | Booth list with item counts |
| `/trips/:tripId/booths/:boothId` | `BoothDetailPage` | Items at this booth |
| `/trips/:tripId/settings` | `SettingsPage` | Trip name, dates, budget, rates, collaborators |

Routes under `/trips/:tripId` are wrapped in a layout that provides `TripContext` and the bottom tab nav (Items / Booths / Settings).

### Main screen layout (`ItemsPage`)

1. **Top bar** — trip name (tap to switch to picker) + settings icon.
2. **Budget card** — `¥ remaining` headline, `≈ HK$ X · US$ Y` subtitle, progress bar, "spent ¥X of ¥Y" caption.
3. **Filter row** — status chips (All / Spotted / Bought / Passed) + star chip (`★ 4+`) + booth filter chip (set from BoothDetail page or cleared).
4. **Search box** — partial keyword against `remarkLower` (prefix match).
5. **Item list** — vertically scrolling cards, see card layout below.
6. **Quick-add FAB** — opens `QuickAddSheet`.
7. **Bottom nav** — Items / Booths / Settings tabs.

### Item card layout

- Square thumbnail (first photo, fallback placeholder).
- Title line: `formFactor · {opalTypeTags joined with ", "}` (or "—" if no tags).
- Booth line: `{boothNumber} · {vendorName}`.
- Price line: strikethrough vendor asking, bold discounted price, "(-N%)" suffix. If `bought`, replaces with bold green `finalPaidJpy` + "paid".
- HKD/USD subtitle.
- Stars line: 5-position display.
- Status pill: tappable to open status sheet.

Tapping the card body opens `ItemDetailPage`.

### Quick-add sheet

Bottom sheet with three fields, optimized for one-handed show-floor use:

1. Photo (camera or library picker, single tap to launch).
2. Booth (autocomplete picker showing existing booths in trip; "+ New booth" inline opens a sub-sheet with number + vendor name).
3. Vendor asking JPY + discount % (two compact numeric inputs side-by-side).

On save: creates the item with defaults (`status: "spotted"`, `interestStars: 3`, no opal tags, no remark, no target/resale/final prices). User can finish the rest from the detail page.

### Item detail

Full form with sections:

- Photos (up to 5; tap thumb to view, long-press to delete).
- Form factor (single-select chip group).
- Opal types (freeform tag input — type + enter, backspace to delete).
- Remark (multiline).
- Booth (picker).
- Prices: vendor asking, discount %, discounted (read-only computed), target buy, planned resale.
- Currency overrides (collapsible; shows the auto-conversion result by default).
- Interest stars (tappable 1–5).
- Status (pill; bought requires final paid).

## Sharing model

- **Trip ownership:** the user who creates the trip is `ownerUid`. Owner can edit collaborators and delete the trip.
- **Collaborators:** owner adds Google emails on the Settings screen. The app looks up `uid` by email via a `/users` query (requires that the invitee has already signed in once to create their `/users/{uid}` doc). If the user hasn't signed in yet, the invite stays "pending" in a local UI state and the owner is shown a note to try again later. (Simpler than implementing a real invite-acceptance flow.)
- **Removing:** owner can remove a collaborator at any time. Removed collaborator loses access immediately on next listener event.
- **Trip-picker visibility:** each signed-in user fetches trips where `ownerUid == uid OR uid in collaboratorUids`. (Two listeners merged client-side; or a single query using `array-contains` plus a parallel `where ownerUid == uid`.)

## Security rules

### Firestore

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

### Storage

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

## Photo upload pipeline

1. **Pick** — `<input type="file" accept="image/*" capture="environment">` on mobile (camera) and the same input without `capture` on desktop. Multiple files allowed up to 5 minus existing count.
2. **Compress** — for each file: `browser-image-compression` with `maxSizeMB: 1`, `maxWidthOrHeight: 1200`, `useWebWorker: true`.
3. **(Optional, deferred)** Generate a 200px thumbnail via the same library with separate options; skip if it adds noticeable latency on slow phones.
4. **Upload** — `uploadBytes` to `trips/{tripId}/items/{itemId}/{photoId}.jpg`. Show per-photo progress.
5. **Patch item** — append `{photoId, storagePath, thumbPath, width, height, uploadedAt, uploadedByUid}` to the item's `photos` array via `arrayUnion`.
6. **Delete** — `deleteObject` for both storage paths, then `arrayRemove` the photo entry. Retries handled by simple "Retry" button on failure.

## Online-only behavior

- A small "offline" indicator chip surfaces when `navigator.onLine === false` or a Firestore write fails with `unavailable`. Writes attempted while offline show a toast "Connect to wifi to save."
- Reads work from Firestore's in-memory cache after first load, but the app makes no claims about offline mutations.

## Code structure

```
src/
  firebase.ts                       moved from infrastructure/config/firebase.config.ts
  main.tsx
  App.tsx                           BrowserRouter + Routes
  index.css
  context/
    TripContext.tsx                 currentTripId + trip doc
  hooks/
    useAuth.ts                      Firebase Auth user
    useTrips.ts                     list of trips (owned + collaborated)
    useTrip.ts                      single trip doc subscription
    useItems.ts                     items in current trip + client-side filtering/search
    useBooths.ts                    booths in current trip
    useUploadPhoto.ts               compress + upload helper
  pages/
    SignInPage.tsx
    TripPickerPage.tsx
    ItemsPage.tsx
    ItemDetailPage.tsx
    BoothsPage.tsx
    BoothDetailPage.tsx
    SettingsPage.tsx
  components/
    layout/
      TripLayout.tsx                wraps trip-scoped pages, provides TripContext + bottom nav
      BottomNav.tsx
      OfflineBanner.tsx
      ProtectedRoute.tsx
    items/
      ItemCard.tsx
      ItemForm.tsx
      QuickAddSheet.tsx
      StatusPill.tsx
      PhotoUploader.tsx
      PhotoGallery.tsx
      StarRating.tsx
      OpalTagInput.tsx
    booths/
      BoothPicker.tsx
      BoothForm.tsx
    budget/
      BudgetCard.tsx
      BudgetAdjustSheet.tsx
      RateEditor.tsx
    ui/                             primitives — Button, Input, Chip, Sheet, Modal, Toast
  lib/
    currency.ts                     jpyTo{Usd,Hkd}, formatJpy/Usd/Hkd, discountMath, budgetMath
    search.ts                       remarkLower normalizer + filter
    types.ts                        Trip, Item, Booth, Photo, Status, FormFactor
    firestorePaths.ts               typed path helpers
```

### Dependencies to add

- `react-router-dom` — routing
- `react-hook-form` — forms
- `browser-image-compression` — photo compression
- `uuid` — photo ids (or use `crypto.randomUUID`)
- `clsx` — class composition

(`firebase` already present.)

## Open questions / explicit decisions

- **Discount input:** percentage only for v1. If absolute-yen discounts come up at the show, we'll add a toggle later.
- **Invite acceptance:** owner adds by email; invitee gets access immediately if they've ever signed in. No accept gate.
- **Per-item buyer attribution (which collaborator bought it):** out of scope for v1; we record `createdByUid` and `updatedByUid` but don't surface them in UI yet.
- **Trip deletion of orphan booths/items:** v1 leaves orphans (trip delete + manual subcollection cleanup is fine for our scale); we may add a Cloud Function later if it becomes an issue.

## Testing plan

- **Unit:** `lib/currency.ts` math (discount, conversion, budget remaining, HKD-helper round-trip). `lib/search.ts` remark normalization.
- **Manual UAT on phone before the show:**
  - Sign in on two phones with two Google accounts.
  - Owner creates a trip, invites collaborator.
  - Both phones see the trip; add items concurrently; updates appear in real time.
  - Add 5 photos to one item; both phones see them.
  - Mark an item bought; budget remaining drops on both phones.
  - Adjust budget via HKD helper; check JPY total updates correctly.
  - Toggle airplane mode; confirm offline indicator shows; reconnect; queued reads resume.

## Build sequence (preview)

The implementation plan will be written separately, but rough order:

1. Auth + protected routing + sign-in page.
2. Trip CRUD + trip picker + settings (no items yet).
3. Booths CRUD + booth picker.
4. Items CRUD + quick-add + main list with filters.
5. Photo upload pipeline.
6. Budget card + budget adjust + rate editor.
7. Item detail with all four prices and overrides.
8. Status workflow + interest stars + search.
9. Collaborators (invite/remove on Settings).
10. Security rules + manual UAT.
