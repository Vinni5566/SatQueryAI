type MarkProps = { className?: string }

export function LogoSqMark({ className = 'h-9 w-9' }: MarkProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`text-ink ${className}`}
      aria-hidden="true"
    >
      <path
        d="M18 16 H30 C38 16 42 22 42 28 C42 34 38 40 30 40 H18 Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M34 40 L46 52"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="50" cy="54" r="4" className="fill-accent" />
      <path
        d="M14 48 Q32 58 50 42"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  )
}
