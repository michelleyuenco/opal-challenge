import { Routes, Route, Navigate } from 'react-router-dom'

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<div className="p-6">Sign-in (Task 4)</div>} />
      <Route path="/" element={<div className="p-6">Trip picker (Task 5)</div>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
