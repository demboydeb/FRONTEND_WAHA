import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { PrivateRoute } from '@/components/layout/PrivateRoute'
import { useAuthStore } from '@/stores/auth.store'

const ProtectedPage = () => <div>Protected Content</div>
const LoginPage = () => <div>Login Page</div>

const renderWithRouter = (isAuthenticated: boolean, initialPath = '/protected') => {
  useAuthStore.setState({ isAuthenticated, user: null, accessToken: null, refreshToken: null })

  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<PrivateRoute />}>
          <Route path="/protected" element={<ProtectedPage />} />
        </Route>
      </Routes>
    </MemoryRouter>
  )
}

describe('PrivateRoute', () => {
  beforeEach(() => {
    useAuthStore.setState({ isAuthenticated: false, user: null, accessToken: null, refreshToken: null })
  })

  it('renders protected content when authenticated', () => {
    renderWithRouter(true)
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('redirects to /login when not authenticated', () => {
    renderWithRouter(false)
    expect(screen.getByText('Login Page')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('does not render protected page when token is null', () => {
    useAuthStore.setState({ isAuthenticated: false, accessToken: null, refreshToken: null, user: null })
    renderWithRouter(false)
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })
})
