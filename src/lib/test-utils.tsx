import React, { type ReactElement } from 'react'
import { render, type RenderOptions } from '@testing-library/react'

/**
 * Custom render function for React Testing Library
 * Wraps components with any necessary providers (theme, router, etc.)
 */

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

/**
 * Custom render function with providers
 */
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything from React Testing Library
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'

// Override render with our custom implementation
export { customRender as render }
