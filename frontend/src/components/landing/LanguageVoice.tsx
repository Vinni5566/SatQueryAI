import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

const samples = [
  { lang: 'EN', text: 'Highlight the water body in this scene.' },
  { lang: 'हिं', text: 'इस दृश्य में जल क्षेत्र कहाँ है?' },
  { lang: 'த', text: 'இந்த காட்சியில் நீர்நிலை எங்கே?' },
  { lang: 'EN', text: 'What changed between these two dates?' },
]

export function LanguageVoice() {
  const reduceMotion = useReducedMotion()
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (reduceMotion) return
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % samples.length)
    }, 3200)
    return () => window.clearInterval(id)
  }, [reduceMotion])

  const current = samples[index]

  return (
    <section
      className="relative overflow-hidden border-t border-border bg-navy py-20 text-white sm:py-28"
      aria-labelledby="language-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            'radial-gradient(ellipse at 20% 30%, rgba(232,93,4,0.25), transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(13,148,136,0.2), transparent 45%)',
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-6">
        <p className="text-xs font-semibold tracking-[0.18em] text-accent uppercase">
          How you ask
        </p>
        <h2
          id="language-heading"
          className="mt-2 max-w-xl font-display text-3xl font-bold sm:text-4xl"
        >
          Type it. Speak it. In the language you already use.
        </h2>
        <p className="mt-3 max-w-lg text-sm text-white/65 sm:text-base">
          Multilingual queries and spoken questions — so an officer at 11 pm
          does not have to translate GIS jargon first.
        </p>

        <div className="mt-12 grid gap-8 lg:grid-cols-2 lg:gap-14">
          {/* Typed queries */}
          <div className="relative min-h-[220px] rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <p className="text-xs font-medium tracking-wide text-white/50 uppercase">
              Multilingual query
            </p>
            <div className="mt-6 space-y-3">
              {samples.map((sample, i) => (
                <motion.div
                  key={`${sample.lang}-${sample.text}`}
                  animate={{
                    opacity: i === index ? 1 : 0.25,
                    x: i === index ? 0 : -6,
                    scale: i === index ? 1 : 0.98,
                  }}
                  transition={{ duration: reduceMotion ? 0 : 0.35 }}
                  className={`rounded-xl px-4 py-3 ${
                    i === index
                      ? 'bg-accent/20 ring-1 ring-accent/50'
                      : 'bg-white/5'
                  }`}
                >
                  <span className="text-[10px] font-semibold tracking-wider text-accent uppercase">
                    {sample.lang}
                  </span>
                  <p className="mt-1 text-sm text-white/90">{sample.text}</p>
                </motion.div>
              ))}
            </div>
            <p className="sr-only" aria-live="polite">
              Example: {current.text}
            </p>
          </div>

          {/* Voice */}
          <div className="relative flex min-h-[220px] flex-col justify-between rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <div>
              <p className="text-xs font-medium tracking-wide text-white/50 uppercase">
                Multilingual audio
              </p>
              <p className="mt-4 font-display text-2xl font-semibold">
                Speak the question
              </p>
              <p className="mt-2 text-sm text-white/65">
                We listen in more than one language — hands free when you are
                looking at the map, not the keyboard.
              </p>
            </div>

            <div className="mt-8 flex items-end gap-1.5" aria-hidden>
              {Array.from({ length: 24 }).map((_, i) => (
                <motion.span
                  key={i}
                  className="w-1.5 rounded-full bg-water"
                  animate={
                    reduceMotion
                      ? { height: 12 + (i % 5) * 6 }
                      : {
                          height: [
                            8 + (i % 4) * 4,
                            18 + (i % 7) * 8,
                            10 + (i % 3) * 5,
                          ],
                        }
                  }
                  transition={{
                    duration: 1.2 + (i % 5) * 0.1,
                    repeat: Infinity,
                    repeatType: 'mirror',
                    ease: 'easeInOut',
                  }}
                  style={{ height: 16 }}
                />
              ))}
              <div className="ml-4 flex h-12 w-12 items-center justify-center rounded-full border-2 border-accent bg-accent/20">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-accent"
                  aria-hidden
                >
                  <path
                    d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Z"
                    fill="currentColor"
                  />
                  <path
                    d="M5 11a7 7 0 0 0 14 0M12 18v3"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
