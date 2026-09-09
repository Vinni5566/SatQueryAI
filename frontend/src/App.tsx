import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import { ThemeContext } from './ThemeContext'
import { DesignPreviewPage } from './pages/DesignPreviewPage'
import { AskScenePage } from './pages/AskScenePage'
import { ChangeScenePage } from './pages/ChangeScenePage'
import { CloudJobPage } from './pages/JobStubPages'
import { HomePage } from './pages/HomePage'
import { SignInPage } from './pages/SignInPage'
import { SignUpPage } from './pages/SignUpPage'
import { ROUTES } from './routes'
import { initTheme, toggleTheme, type Theme } from './theme'

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as
  | string
  | undefined

function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    setTheme(initTheme())
  }, [])

  const value = useMemo(
    () => ({
      theme,
      toggleTheme: () => setTheme((current) => toggleTheme(current)),
    }),
    [theme],
  )

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  )
}

function MissingClerkKey() {
  return (
    <div className="mx-auto max-w-lg px-6 py-20 text-ink">
      <h1 className="text-xl font-bold">Clerk publishable key missing</h1>
      <p className="mt-3 text-sm text-muted">
        Add <code className="text-ink">VITE_CLERK_PUBLISHABLE_KEY</code> to{' '}
        <code className="text-ink">frontend/.env.local</code>, then restart{' '}
        <code className="text-ink">npm run dev</code>. See{' '}
        <code className="text-ink">.env.example</code>.
      </p>
    </div>
  )
}

export default function App() {
  if (!publishableKey) {
    return <MissingClerkKey />
  }

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      afterSignOutUrl={ROUTES.home}
    >
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path={ROUTES.home} element={<HomePage />} />
            <Route path={ROUTES.ask} element={<AskScenePage />} />
            <Route path={ROUTES.change} element={<ChangeScenePage />} />
            <Route path={ROUTES.cloud} element={<CloudJobPage />} />
            <Route path={`${ROUTES.signIn}/*`} element={<SignInPage />} />
            <Route path={`${ROUTES.signUp}/*`} element={<SignUpPage />} />
            <Route path={ROUTES.design} element={<DesignPreviewPage />} />
            <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </ClerkProvider>
  )
}
