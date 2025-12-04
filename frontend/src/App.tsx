import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import LoginPage from './pages/LoginPage'
import DashboardLayout from './layouts/DashboardLayout'
import DashboardPage from './pages/DashboardPage'

function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <Routes>
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
      />
      <Route
        path="/*"
        element={
          isAuthenticated ? (
            <DashboardLayout>
              <Routes>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                {/* More routes will be added here */}
              </Routes>
            </DashboardLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  )
}

export default App

