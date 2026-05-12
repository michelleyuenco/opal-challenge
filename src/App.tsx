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
