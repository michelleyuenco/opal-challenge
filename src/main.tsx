import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createDIContainer } from '@di/container'
import { DIProvider } from '@presentation/providers/DIProvider'
import { AuthProvider } from '@presentation/providers/AuthProvider'
import { App } from './App'
import '@presentation/styles/index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})

const container = createDIContainer()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <DIProvider container={container}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </DIProvider>
    </QueryClientProvider>
  </StrictMode>,
)
