import { Link } from 'react-router-dom'
import {
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/clerk-react'
import { Button } from './Button'
import { Logo } from './Logo'
import { ThemeToggle } from './ThemeToggle'
import { useTheme } from '../ThemeContext'
import { ROUTES } from '../routes'

export function Navbar() {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="border-b border-border bg-bg">
      <div className="h-0.5 w-full bg-accent" aria-hidden="true" />
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
        <Link to={ROUTES.home} className="no-underline">
          <Logo theme={theme} />
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
          <span className="text-sm text-muted" aria-label="Language">
            <span className="font-medium text-ink">EN</span>
            <span className="mx-1.5 text-border">|</span>
            <span>हिं</span>
          </span>
          <SignedOut>
            <Link to={ROUTES.signIn}>
              <Button variant="secondary">Sign in</Button>
            </Link>
            <Link to={ROUTES.signUp}>
              <Button variant="primary">Sign up</Button>
            </Link>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl={ROUTES.home} />
          </SignedIn>
        </div>
      </div>
    </header>
  )
}
