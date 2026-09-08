import { ThemeToggle } from './ThemeToggle'
import { Logo } from './Logo'
import type { Theme } from '../theme'

type NavbarProps = {
  theme: Theme
  onToggleTheme: () => void
}

export function Navbar({ theme, onToggleTheme }: NavbarProps) {
  return (
    <header className="border-b border-border bg-bg">
      <div className="h-0.5 w-full bg-accent" aria-hidden="true" />
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
        <Logo theme={theme} />
        <div className="flex items-center gap-3">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <span className="text-sm text-muted" aria-label="Language">
            <span className="font-medium text-ink">EN</span>
            <span className="mx-1.5 text-border">|</span>
            <span>हिं</span>
          </span>
        </div>
      </div>
    </header>
  )
}
