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
