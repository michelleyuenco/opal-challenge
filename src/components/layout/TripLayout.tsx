import { Outlet, useParams, Navigate } from 'react-router-dom'
import { useTrip } from '../../hooks/useTrip'
import { TripProvider } from '../../context/TripContext'
import { BottomNav } from './BottomNav'
import { OfflineBanner } from './OfflineBanner'

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
        <OfflineBanner />
        <main className="flex-1 pb-2">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </TripProvider>
  )
}
