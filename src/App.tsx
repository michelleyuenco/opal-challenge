import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import { Navbar } from '@presentation/components/layout/Navbar'
import { Footer } from '@presentation/components/layout/Footer'
import { AdminSidebar } from '@presentation/components/layout/AdminSidebar'
import { ProtectedRoute } from '@presentation/components/layout/ProtectedRoute'
import { ErrorBoundary } from '@presentation/components/ui/ErrorBoundary'

// Public pages
import { HomePage } from '@presentation/pages/public/HomePage'
import { GalleryPage } from '@presentation/pages/public/GalleryPage'
import { OpalDetailPage } from '@presentation/pages/public/OpalDetailPage'
import { DatasetPage } from '@presentation/pages/public/DatasetPage'
import { ChallengePage } from '@presentation/pages/public/ChallengePage'
import { ResultsPage } from '@presentation/pages/public/ResultsPage'

// Auth pages
import { LoginPage } from '@presentation/pages/auth/LoginPage'
import { LogoutPage } from '@presentation/pages/auth/LogoutPage'

// Poster pages
import { PosterChallengePage } from '@presentation/pages/poster/PosterChallengePage'
import { MyPostersPage } from '@presentation/pages/poster/MyPostersPage'
import { PosterEditorPage } from '@presentation/pages/poster/PosterEditorPage'
import { PosterJourneyPage } from '@presentation/pages/poster/PosterJourneyPage'

// Admin pages
import { AdminDashboardPage } from '@presentation/pages/admin/AdminDashboardPage'
import { ManageOpalsPage } from '@presentation/pages/admin/ManageOpalsPage'
import { OpalEditorPage } from '@presentation/pages/admin/OpalEditorPage'
import { ManageChallengePage } from '@presentation/pages/admin/ManageChallengePage'
import { SubmissionsPage } from '@presentation/pages/admin/SubmissionsPage'

function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  )
}

function AdminLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />
      {/* Mobile: tabs rendered by AdminSidebar above content */}
      {/* Desktop: sidebar in flex row with content */}
      <div className="flex flex-1 flex-col sm:flex-row">
        <AdminSidebar />
        <main className="flex-1 p-4 sm:p-6">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="gallery" element={<GalleryPage />} />
          <Route path="gallery/:slug" element={<OpalDetailPage />} />
          <Route path="dataset" element={<DatasetPage />} />
          <Route path="challenge" element={<ChallengePage />} />
          <Route path="challenge/results" element={<ResultsPage />} />
          <Route path="poster" element={<PosterChallengePage />} />
          <Route path="poster/journey/:posterId" element={<PosterJourneyPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="logout" element={<LogoutPage />} />
        </Route>

        {/* Poster authenticated routes */}
        <Route
          element={
            <ProtectedRoute>
              <PublicLayout />
            </ProtectedRoute>
          }
        >
          <Route path="poster/my" element={<MyPostersPage />} />
          <Route path="poster/editor/:posterId" element={<PosterEditorPage />} />
        </Route>

        <Route
          element={
            <ProtectedRoute requireRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="admin" element={<AdminDashboardPage />} />
          <Route path="admin/opals" element={<ManageOpalsPage />} />
          <Route path="admin/opals/:id" element={<OpalEditorPage />} />
          <Route path="admin/challenge" element={<ManageChallengePage />} />
          <Route path="admin/submissions" element={<SubmissionsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
