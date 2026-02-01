import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@/lib/test-utils'
import userEvent from '@testing-library/user-event'
import { LoginForm } from './LoginForm'

/**
 * LoginForm Component Tests
 *
 * Tests the LoginForm component with React Hook Form + Zod validation.
 * This serves as a template for testing forms with validation.
 */

// Mock the API calls
vi.mock('@/lib/api', () => ({
  login: vi.fn().mockResolvedValue({ token: 'test-token', role: 'admin' }),
  forgotPassword: vi.fn().mockResolvedValue({}),
  setAuthToken: vi.fn(),
}))

// Mock the toast notifications
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
  },
}))

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders login form', () => {
    render(<LoginForm />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('allows entering email', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement
    await user.type(emailInput, 'test@example.com')
    expect(emailInput.value).toBe('test@example.com')
  })

  it('allows entering password', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement
    await user.type(passwordInput, 'password123')
    expect(passwordInput.value).toBe('password123')
  })

  it('has a submit button', () => {
    render(<LoginForm />)
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('has a forgot password link', () => {
    render(<LoginForm />)
    const forgotLink = screen.queryByRole('button', { name: /forgot/i })
    expect(forgotLink).toBeTruthy()
  })
})
