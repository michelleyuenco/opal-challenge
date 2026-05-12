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
