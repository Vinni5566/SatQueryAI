import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ThemeContext } from '../ThemeContext'

vi.mock('framer-motion', async () => {
  const React = await import('react')
  const actual = await vi.importActual<typeof import('framer-motion')>(
    'framer-motion',
  )
  const passthrough = ({
    children,
    ...rest
  }: {
    children?: React.ReactNode
    [key: string]: unknown
  }) => React.createElement('div', rest, children)
  return {
    ...actual,
    motion: new Proxy(actual.motion, {
      get(target, prop) {
        const value = target[prop as keyof typeof target]
        if (typeof value === 'object' || typeof value === 'function') {
          return passthrough
        }
        return value
      },
    }),
    useScroll: () => ({
      scrollYProgress: { on: () => () => undefined, get: () => 0 },
    }),
    useTransform: () => ({
      on: () => () => undefined,
      get: () => 0,
    }),
    useReducedMotion: () => true,
    useInView: () => true,
  }
})

import { LandingPage } from './LandingPage'

function mockMatchMedia(matches = false) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

function mockIntersectionObserver() {
  class MockIntersectionObserver {
    readonly root = null
    readonly rootMargin = ''
    readonly thresholds: number[] = []
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
    takeRecords = () => []
  }
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
}

function renderLanding() {
  return render(
    <ThemeContext.Provider
      value={{ theme: 'dark', toggleTheme: () => undefined }}
    >
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    </ThemeContext.Provider>,
  )
}

describe('LandingPage', () => {
  beforeEach(() => {
    mockMatchMedia(true)
    mockIntersectionObserver()
  })

  it('renders marketing landing landmark and brand', () => {
    renderLanding()

    expect(screen.getByTestId('landing')).toBeTruthy()
    expect(
      screen.getByRole('heading', { level: 1, name: 'SatQuery AI' }),
    ).toBeTruthy()
    expect(
      screen.getAllByText(/Ask satellite pictures in plain language/i).length,
    ).toBeGreaterThan(0)
    expect(screen.getByRole('heading', { name: /Pick a mission/i })).toBeTruthy()
    expect(
      screen.getByRole('heading', { name: /Type it\. Speak it/i }),
    ).toBeTruthy()
  })
})
