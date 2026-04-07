import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import type { DIContainer } from '@di/container'

const DIContext = createContext<DIContainer | null>(null)

export function DIProvider({
  container,
  children,
}: {
  container: DIContainer
  children: ReactNode
}) {
  return <DIContext value={container}>{children}</DIContext>
}

export function useDI(): DIContainer {
  const container = useContext(DIContext)
  if (!container) {
    throw new Error('useDI must be used within a DIProvider')
  }
  return container
}
