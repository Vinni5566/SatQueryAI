type MarkProps = { className?: string }

export function LogoOrbitSat({ className = 'h-9 w-9' }: MarkProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`text-ink ${className}`}
      aria-hidden="true"
    >
      <ellipse
        cx="32"
        cy="32"
        rx="22"
        ry="10"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <ellipse
        cx="32"
        cy="32"
        rx="10"
        ry="22"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.45"
      />
      <circle cx="32" cy="32" r="5" fill="currentColor" />
      <rect x="44" y="18" width="10" height="6" rx="1.5" fill="currentColor" />
      <path
        d="M44 21 H38"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="52" cy="14" r="3.5" className="fill-accent" />
    </svg>
  )
}
