import logoDark from '../assets/logos/satquery-logo-dark.png'
import logoLight from '../assets/logos/satquery-logo-light.png'
import type { Theme } from '../theme'

type LogoProps = {
  theme: Theme
  className?: string
}

export function Logo({ theme, className = '' }: LogoProps) {
  const src = theme === 'dark' ? logoDark : logoLight

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img
        src={src}
        alt=""
        width={40}
        height={40}
        className="h-10 w-10 shrink-0 object-contain"
      />
      <div className="leading-tight">
        <div className="text-base font-bold tracking-tight text-ink">
          SatQuery AI
        </div>
        <div className="text-[11px] text-muted">
          Ask satellite pictures in plain language · Department of Space
        </div>
      </div>
    </div>
  )
}
