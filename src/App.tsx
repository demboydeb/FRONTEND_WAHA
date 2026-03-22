import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Layout } from '@/components/layout/Layout'
import { PrivateRoute } from '@/components/layout/PrivateRoute'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { SessionsPage } from '@/pages/SessionsPage'
import { SessionDetailPage } from '@/pages/SessionDetailPage'
import { AntiBanPage } from '@/pages/AntiBanPage'
import { ApiKeysPage } from '@/pages/ApiKeysPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { ContactsPage } from '@/pages/ContactsPage'
import { GroupsPage } from '@/pages/GroupsPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Private routes */}
          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/sessions" element={<SessionsPage />} />
              <Route path="/sessions/:id" element={<SessionDetailPage />} />
              <Route path="/sessions/:id/antiban" element={<AntiBanPage />} />
              <Route path="/api-keys" element={<ApiKeysPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/contacts" element={<ContactsPage />} />
              <Route path="/groups" element={<GroupsPage />} />
            </Route>
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
