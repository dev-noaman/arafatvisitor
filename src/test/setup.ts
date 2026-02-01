import { vi } from 'vitest'
import '@testing-library/jest-dom/vitest'

// Global test setup for Vitest with happy-dom
// This file runs before each test file

// Mock window.matchMedia for responsive components
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // Deprecated
        removeListener: vi.fn(), // Deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
})

    // Mock IntersectionObserver for scroll-based animations
    ; (globalThis as any).IntersectionObserver = class IntersectionObserver {
        constructor() { }
        disconnect() { }
        observe() { }
        takeRecords() {
            return []
        }
        unobserve() { }
    }

    // Mock ResizeObserver for responsive components
    ; (globalThis as any).ResizeObserver = class ResizeObserver {
        constructor() { }
        disconnect() { }
        observe() { }
        unobserve() { }
    }

// Suppress console errors/warnings in tests unless explicitly testing for them
const originalError = console.error
const originalWarn = console.warn

console.error = (...args: any[]) => {
    if (
        typeof args[0] === 'string' &&
        args[0].includes('Warning: ReactDOM.render')
    ) {
        return
    }
    originalError.call(console, ...args)
}

console.warn = (...args: any[]) => {
    if (
        typeof args[0] === 'string' &&
        (args[0].includes('componentWillReceiveProps') ||
            args[0].includes('componentWillMount'))
    ) {
        return
    }
    originalWarn.call(console, ...args)
}
