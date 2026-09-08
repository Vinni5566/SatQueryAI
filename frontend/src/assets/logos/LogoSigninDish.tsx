type MarkProps = { className?: string }

/** Wireframe signup mark: ground dish + three orange signal arcs */
export function LogoSigninDish({ className = 'h-9 w-9' }: MarkProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`text-ink ${className}`}
      aria-hidden="true"
    >
      {/* Base */}
      <path
        d="M20 52 H40"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M30 52 L30 42"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Parabolic dish (tilted up-right) */}
      <path
        d="M14 44 C14 28 26 16 40 16 C40 28 36 38 28 44 Z"
        fill="currentColor"
      />
      <path
        d="M16 42 C22 36 30 30 40 28"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.35"
      />
      {/* Feed horn */}
      <path
        d="M34 24 L46 14"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="47" cy="13" r="2.8" fill="currentColor" />
      {/* Signal arcs */}
      <path
        d="M44 10 C48 8 52 10 54 14"
        className="stroke-accent"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M46 6 C52 3 58 7 60 13"
        className="stroke-accent"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M49 2 C57 -1 64 4 66 12"
        className="stroke-accent"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  )
}
