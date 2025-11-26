import '@testing-library/jest-dom'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver
Object.defineProperty(globalThis, 'IntersectionObserver', {
  writable: true,
  value: vi
    .fn()
    .mockImplementation(
      (
        _callback: IntersectionObserverCallback,
        options?: IntersectionObserverInit
      ) => ({
        root: options?.root || null,
        rootMargin: options?.rootMargin || '0px',
        thresholds: options?.threshold || [0],
        disconnect: vi.fn(),
        observe: vi.fn(),
        takeRecords: vi.fn(() => []),
        unobserve: vi.fn(),
      })
    ),
})
