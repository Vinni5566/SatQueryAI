type MarkProps = { className?: string }

export function LogoRadarArc({ className = 'h-9 w-9' }: MarkProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`text-ink ${className}`}
      aria-hidden="true"
    >
      <path
        d="M32 46 A16 16 0 0 1 32 14"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M32 40 A10 10 0 0 1 32 20"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M32 34 A4 4 0 0 1 32 26"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="32" cy="32" r="3.5" className="fill-accent" />
      <path
        d="M36 28 L48 16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="50" cy="14" r="3" fill="currentColor" />
    </svg>
  )
}
