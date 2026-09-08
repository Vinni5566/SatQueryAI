import type { Theme } from '../theme'

type ThemeToggleProps = {
  theme: Theme
  onToggle: () => void
  className?: string
}

export function ThemeToggle({ theme, onToggle, className = '' }: ThemeToggleProps) {
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-navy bg-surface text-ink shadow-sm transition-colors hover:bg-bg dark:border-accent dark:text-ink ${className}`}
    >
      {isDark ? <DaySatIcon /> : <NightSatIcon />}
      <span className="sr-only">
        {isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      </span>
    </button>
  )
}

/** Light mode control: dayside Earth + sat — tap for night */
function NightSatIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="13" r="6.5" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M11 6.5c2.2 1.4 3.5 3.8 3.5 6.5S13.2 18.1 11 19.5"
        fill="currentColor"
        opacity="0.2"
      />
      <path
        d="M17 5.5 L19.5 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <rect x="15.2" y="5.2" width="4.2" height="2.4" rx="0.6" fill="currentColor" />
      <circle cx="20.2" cy="3.6" r="1.4" className="fill-accent" />
    </svg>
  )
}

/** Dark mode control: night Earth + beacon sat — tap for day */
function DaySatIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="13" r="6.5" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M11 6.5 A6.5 6.5 0 0 0 11 19.5"
        fill="currentColor"
        opacity="0.55"
      />
      <path
        d="M16.5 6 L19 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <rect
        x="14.8"
        y="5.4"
        width="4.2"
        height="2.4"
        rx="0.6"
        className="fill-accent"
      />
      <circle cx="20" cy="4" r="1.6" className="fill-accent" />
    </svg>
  )
}
