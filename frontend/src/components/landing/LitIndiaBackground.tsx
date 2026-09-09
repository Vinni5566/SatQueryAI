type LitIndiaBackgroundProps = {
  /** 0–1 scroll progress through the hero */
  progress: number
  reducedMotion: boolean
}

/** Full-screen lit India map; opacity follows scroll (in down, out up). */
export function litIndiaOpacity(progress: number, reducedMotion: boolean): number {
  if (reducedMotion) return 0.9
  // Fade in early, hold, soft fade as hero ends
  if (progress <= 0.05) return 0
  if (progress < 0.35) return (progress - 0.05) / 0.3
  if (progress < 0.7) return 1
  return Math.max(0.2, 1 - (progress - 0.7) / 0.3)
}

export function LitIndiaBackground({
  progress,
  reducedMotion,
}: LitIndiaBackgroundProps) {
  const opacity = litIndiaOpacity(progress, reducedMotion)

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#050a14]" aria-hidden="true">
      <div
        className="absolute inset-0 will-change-[opacity]"
        style={{ opacity }}
      >
        <img
          src="/landing/india-lights.png"
          alt=""
          className="h-full w-full scale-105 object-cover object-center"
          draggable={false}
        />
        {/* Warm night glow bloom */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 55% 45%, rgba(245,179,1,0.12), transparent 55%)',
            mixBlendMode: 'screen',
          }}
        />
      </div>

      {/* Keep brand text readable */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#050a14]/85 via-[#050a14]/35 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050a14] via-transparent to-[#050a14]/45" />
    </div>
  )
}
