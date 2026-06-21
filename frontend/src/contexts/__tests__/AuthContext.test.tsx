import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider, useAuth } from '../AuthContext'

// ── Helpers ────────────────────────────────────────────────────────────────────

const mockFetch = vi.fn()

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch)
  localStorage.clear()
  mockFetch.mockReset()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

function mockLoginSuccess(token = 'fake-token', user = { id: 1, email: 'test@example.com', name: 'Test User' }) {
  mockFetch.mockResolvedValueOnce(
    new Response(JSON.stringify({ access_token: token, user }), { status: 200 }),
  )
}

function mockLoginFailure() {
  mockFetch.mockResolvedValueOnce(new Response('Unauthorized', { status: 401 }))
}

// A minimal consumer component that exercises the auth context
function AuthConsumer() {
  const { isAuthenticated, user, login, logout } = useAuth()
  return (
    <div>
      <span data-testid="auth-status">{isAuthenticated ? 'authenticated' : 'guest'}</span>
      <span data-testid="user-name">{user?.name ?? 'none'}</span>
      <button onClick={() => login('a@b.com', 'secret')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  )
}

function renderWithProvider() {
  return render(
    <AuthProvider>
      <AuthConsumer />
    </AuthProvider>,
  )
}

// ── isAuthenticated ────────────────────────────────────────────────────────────

describe('isAuthenticated', () => {
  it('is false initially when localStorage is empty', () => {
    renderWithProvider()
    expect(screen.getByTestId('auth-status').textContent).toBe('guest')
  })

  it('is true after a successful login', async () => {
    mockLoginSuccess()
    renderWithProvider()

    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: /login/i }))
    })

    await waitFor(() => {
      expect(screen.getByTestId('auth-status').textContent).toBe('authenticated')
    })
  })

  it('is false again after logout', async () => {
    mockLoginSuccess()
    renderWithProvider()

    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: /login/i }))
    })
    await waitFor(() => expect(screen.getByTestId('auth-status').textContent).toBe('authenticated'))

    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: /logout/i }))
    })

    expect(screen.getByTestId('auth-status').textContent).toBe('guest')
  })
})

// ── login ──────────────────────────────────────────────────────────────────────

describe('login', () => {
  it('stores the token in localStorage on success', async () => {
    mockLoginSuccess('jwt-abc')
    renderWithProvider()

    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: /login/i }))
    })

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('jwt-abc')
    })
  })

  it('stores the user object as JSON in localStorage', async () => {
    const user = { id: 42, email: 'marie@ecole.fr', name: 'Marie' }
    mockLoginSuccess('t', user)
    renderWithProvider()

    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: /login/i }))
    })

    await waitFor(() => {
      expect(JSON.parse(localStorage.getItem('user') ?? '{}')).toEqual(user)
    })
  })

  it('displays the user name after login', async () => {
    mockLoginSuccess('t', { id: 1, email: 'x@y.com', name: 'Sophie' })
    renderWithProvider()

    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: /login/i }))
    })

    await waitFor(() => {
      expect(screen.getByTestId('user-name').textContent).toBe('Sophie')
    })
  })

  it('throws when the server returns an error', async () => {
    mockLoginFailure()

    let thrown: Error | null = null
    function CapturingConsumer() {
      const { login } = useAuth()
      return (
        <button
          onClick={async () => {
            try { await login('bad@x.com', 'wrong') }
            catch (e) { thrown = e as Error }
          }}
        >
          Login
        </button>
      )
    }

    render(
      <AuthProvider>
        <CapturingConsumer />
      </AuthProvider>,
    )

    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: /login/i }))
    })

    expect(thrown).not.toBeNull()
    expect((thrown as Error).message).toBe('Identifiants incorrects')
  })
})

// ── logout ─────────────────────────────────────────────────────────────────────

describe('logout', () => {
  it('removes token from localStorage', async () => {
    mockLoginSuccess()
    renderWithProvider()

    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: /login/i }))
    })
    await waitFor(() => expect(localStorage.getItem('token')).not.toBeNull())

    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: /logout/i }))
    })

    expect(localStorage.getItem('token')).toBeNull()
  })

  it('removes user from localStorage', async () => {
    mockLoginSuccess()
    renderWithProvider()

    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: /login/i }))
    })
    await waitFor(() => expect(localStorage.getItem('user')).not.toBeNull())

    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: /logout/i }))
    })

    expect(localStorage.getItem('user')).toBeNull()
  })

  it('clears the user name from the UI', async () => {
    mockLoginSuccess('t', { id: 1, email: 'a@b.com', name: 'Pierre' })
    renderWithProvider()

    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: /login/i }))
    })
    await waitFor(() => expect(screen.getByTestId('user-name').textContent).toBe('Pierre'))

    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: /logout/i }))
    })

    expect(screen.getByTestId('user-name').textContent).toBe('none')
  })
})

// ── useAuth outside provider ───────────────────────────────────────────────────

describe('useAuth', () => {
  it('throws when used outside of AuthProvider', () => {
    // Suppress React error boundary noise
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    function Rogue() {
      useAuth()
      return null
    }

    expect(() => render(<Rogue />)).toThrow('useAuth must be used inside AuthProvider')

    consoleError.mockRestore()
  })
})
