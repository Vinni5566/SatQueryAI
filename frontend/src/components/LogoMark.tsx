import { LOGO_MARKS } from '../assets/logos'
import type { LogoId } from '../logo'

type LogoMarkProps = {
  id: LogoId
  className?: string
}

export function LogoMark({ id, className }: LogoMarkProps) {
  const Mark = LOGO_MARKS[id]
  return <Mark className={className} />
}
