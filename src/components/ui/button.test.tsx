import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/lib/test-utils'
import { Button } from './button'

/**
 * Button Component Tests
 *
 * Tests the basic Button component with different variants and sizes.
 * This serves as a template for testing simple UI components.
 */

describe('Button', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>)
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
  })

  it('renders with default variant', () => {
    render(<Button>Default Button</Button>)
    const button = screen.getByRole('button', { name: /default button/i })
    expect(button).toBeInTheDocument()
  })

  it('renders with destructive variant', () => {
    render(<Button variant="destructive">Delete</Button>)
    const button = screen.getByRole('button', { name: /delete/i })
    expect(button).toBeInTheDocument()
  })

  it('renders with outline variant', () => {
    render(<Button variant="outline">Outline</Button>)
    const button = screen.getByRole('button', { name: /outline/i })
    expect(button).toBeInTheDocument()
  })

  it('renders with secondary variant', () => {
    render(<Button variant="secondary">Secondary</Button>)
    const button = screen.getByRole('button', { name: /secondary/i })
    expect(button).toBeInTheDocument()
  })

  it('renders with ghost variant', () => {
    render(<Button variant="ghost">Ghost</Button>)
    const button = screen.getByRole('button', { name: /ghost/i })
    expect(button).toBeInTheDocument()
  })

  it('renders with link variant', () => {
    render(<Button variant="link">Link</Button>)
    const button = screen.getByRole('button', { name: /link/i })
    expect(button).toBeInTheDocument()
  })

  it('renders with small size', () => {
    render(<Button size="sm">Small</Button>)
    const button = screen.getByRole('button', { name: /small/i })
    expect(button).toBeInTheDocument()
  })

  it('renders with large size', () => {
    render(<Button size="lg">Large</Button>)
    const button = screen.getByRole('button', { name: /large/i })
    expect(button).toBeInTheDocument()
  })

  it('renders with icon size', () => {
    render(<Button size="icon">🔍</Button>)
    const button = screen.getByRole('button', { name: /🔍/i })
    expect(button).toBeInTheDocument()
  })

  it('handles click events', async () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Clickable</Button>)
    const button = screen.getByRole('button', { name: /clickable/i })

    await button.click()
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('can be disabled', () => {
    render(<Button disabled>Disabled</Button>)
    const button = screen.getByRole('button', { name: /disabled/i }) as HTMLButtonElement
    expect(button.disabled).toBe(true)
  })

  it('applies custom className', () => {
    render(<Button className="custom-class">Custom</Button>)
    const button = screen.getByRole('button', { name: /custom/i })
    expect(button).toBeInTheDocument()
  })

  it('combines variant and size classes correctly', () => {
    render(<Button variant="destructive" size="lg">Destructive Large</Button>)
    const button = screen.getByRole('button', { name: /destructive large/i })
    expect(button).toBeInTheDocument()
  })

  it('supports aria attributes', () => {
    render(<Button aria-label="Close dialog">×</Button>)
    const button = screen.getByRole('button', { name: /close dialog/i })
    expect(button).toHaveAttribute('aria-label', 'Close dialog')
  })
})
