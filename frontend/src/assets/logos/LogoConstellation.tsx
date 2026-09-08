type MarkProps = { className?: string }

export function LogoConstellation({ className = 'h-9 w-9' }: MarkProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`text-ink ${className}`}
      aria-hidden="true"
    >
      <path
        d="M14 40 L28 18 L42 36 L50 22"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="14" cy="40" r="4" fill="currentColor" />
      <circle cx="28" cy="18" r="4" fill="currentColor" />
      <circle cx="42" cy="36" r="4" fill="currentColor" />
      <circle cx="50" cy="22" r="5" className="fill-accent" />
    </svg>
  )
}
