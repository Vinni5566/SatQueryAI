import type { ComponentType } from 'react'
import { LogoConstellation } from './LogoConstellation'
import { LogoDishBeam } from './LogoDishBeam'
import { LogoGlobeScan } from './LogoGlobeScan'
import { LogoOrbitSat } from './LogoOrbitSat'
import { LogoRadarArc } from './LogoRadarArc'
import { LogoSigninDish } from './LogoSigninDish'
import { LogoSqMark } from './LogoSqMark'
import type { LogoId } from '../../logo'

type MarkProps = { className?: string }

export const LOGO_MARKS: Record<LogoId, ComponentType<MarkProps>> = {
  'signin-dish': LogoSigninDish,
  'dish-beam': LogoDishBeam,
  'orbit-sat': LogoOrbitSat,
  'globe-scan': LogoGlobeScan,
  'sq-mark': LogoSqMark,
  constellation: LogoConstellation,
  'radar-arc': LogoRadarArc,
}
