import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { SignInPage } from './pages/SignInPage'
import { TripPickerPage } from './pages/TripPickerPage'
import { TripLayout } from './components/layout/TripLayout'
import { SettingsPage } from './pages/SettingsPage'
import { BoothsPage } from './pages/BoothsPage'
import { ItemsPage } from './pages/ItemsPage'
import { ItemDetailPage } from './pages/ItemDetailPage'
import { BoothDetailPage } from './pages/BoothDetailPage'

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
          <Route index element={<ItemsPage />} />
          <Route path="booths" element={<BoothsPage />} />
          <Route path="booths/:boothId" element={<BoothDetailPage />} />
          <Route path="items/:itemId" element={<ItemDetailPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
