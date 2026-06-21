import React from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { MemoryRouter, type MemoryRouterProps } from 'react-router-dom'
import { AuthProvider } from '../contexts/AuthContext'
import type { ReactElement } from 'react'

interface RenderWithRouterOptions extends RenderOptions {
  routerProps?: MemoryRouterProps
  withAuth?: boolean
}

export function renderWithRouter(
  ui: ReactElement,
  { routerProps, withAuth = true, ...renderOptions }: RenderWithRouterOptions = {},
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    const inner = (
      <MemoryRouter {...routerProps}>
        {children}
      </MemoryRouter>
    )
    return withAuth ? <AuthProvider>{inner}</AuthProvider> : inner
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

export { screen, waitFor, within, fireEvent, act } from '@testing-library/react'
export { userEvent } from '@testing-library/user-event'
