import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { SignInPage } from './pages/SignInPage'
import { TripPickerPage } from './pages/TripPickerPage'
import { TripLayout } from './components/layout/TripLayout'
import { SettingsPage } from './pages/SettingsPage'
import { BoothsPage } from './pages/BoothsPage'

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
          <Route path="booths" element={<BoothsPage />} />
          <Route path="booths/:boothId" element={<div className="p-4">Booth detail (Task 13)</div>} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
