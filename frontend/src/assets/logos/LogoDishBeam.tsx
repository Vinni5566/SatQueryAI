type MarkProps = { className?: string }

export function LogoDishBeam({ className = 'h-9 w-9' }: MarkProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`text-ink ${className}`}
      aria-hidden="true"
    >
      <path
        d="M10 44c0-10 8-18 18-18"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M12 50c8 4 20 4 28 0"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M28 26 L48 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="51" cy="8" r="5" className="fill-accent" />
      <circle cx="28" cy="44" r="3" fill="currentColor" />
    </svg>
  )
}
