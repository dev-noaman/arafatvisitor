import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import { BrowserRouter } from 'react-router'
import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { SidebarProvider } from '@/context/SidebarContext'

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <SidebarProvider>
              {children}
            </SidebarProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </HelmetProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }
