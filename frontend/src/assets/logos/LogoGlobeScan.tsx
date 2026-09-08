type MarkProps = { className?: string }

export function LogoGlobeScan({ className = 'h-9 w-9' }: MarkProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`text-ink ${className}`}
      aria-hidden="true"
    >
      <circle cx="32" cy="32" r="18" stroke="currentColor" strokeWidth="2.5" />
      <ellipse
        cx="32"
        cy="32"
        rx="8"
        ry="18"
        stroke="currentColor"
        strokeWidth="1.8"
        opacity="0.55"
      />
      <path
        d="M14 32 H50"
        stroke="currentColor"
        strokeWidth="1.8"
        opacity="0.55"
      />
      <path
        d="M20 18 Q32 28 48 22"
        className="stroke-accent"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="48" cy="22" r="3" className="fill-accent" />
    </svg>
  )
}
