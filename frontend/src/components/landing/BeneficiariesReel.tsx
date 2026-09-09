import { motion, useReducedMotion } from 'framer-motion'

const beneficiaries = [
  {
    id: 'disaster',
    role: 'District disaster / SDM',
    benefit:
      'Minutes instead of a GIS ticket — a map-backed answer you can send to collectors.',
    query: 'Where did water increase — did it reach the highway?',
    image: '/landing/beneficiary-disaster.png',
    align: 'left' as const,
  },
  {
    id: 'planner',
    role: 'City / town planner',
    benefit:
      'Built-up trends without hiring a vendor for every question — even when monsoon optical is weak.',
    query: 'Has built-up grown into the floodplain?',
    image: '/landing/beneficiary-planner.png',
    align: 'right' as const,
  },
  {
    id: 'water',
    role: 'Agriculture / water officer',
    benefit:
      'Safer water calls when one sensor lies — optical and radar together.',
    query: 'Highlight the water — use optical and radar together.',
    image: '/landing/beneficiary-water.png',
    align: 'left' as const,
  },
  {
    id: 'intern',
    role: 'State RS-centre intern',
    benefit:
      'Scene description without picking models or learning another GIS stack.',
    query: 'Describe land cover and major objects.',
    image: '/landing/beneficiary-intern.png',
    align: 'right' as const,
  },
]

export function BeneficiariesReel() {
  const reduceMotion = useReducedMotion()

  return (
    <section
      className="border-t border-border bg-bg"
      aria-labelledby="beneficiaries-heading"
    >
      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <p className="text-xs font-semibold tracking-[0.18em] text-accent uppercase">
          Who it is for
        </p>
        <h2
          id="beneficiaries-heading"
          className="mt-2 max-w-xl font-display text-3xl font-bold text-ink"
        >
          Built for the night shift — not the GIS lab.
        </h2>
      </div>

      <div className="flex flex-col">
        {beneficiaries.map((person, index) => (
          <motion.article
            key={person.id}
            initial={reduceMotion ? false : { opacity: 0 }}
            whileInView={reduceMotion ? undefined : { opacity: 1 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.6 }}
            className="relative min-h-[70vh] overflow-hidden"
          >
            <img
              src={person.image}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
            <div
              className={`absolute inset-0 ${
                person.align === 'left'
                  ? 'bg-gradient-to-r from-[#050a14]/95 via-[#050a14]/70 to-transparent'
                  : 'bg-gradient-to-l from-[#050a14]/95 via-[#050a14]/70 to-transparent'
              }`}
            />

            <div
              className={`relative mx-auto flex min-h-[70vh] max-w-6xl items-center px-6 py-16 ${
                person.align === 'right' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div className="max-w-md text-white">
                <span className="font-display text-5xl font-bold text-white/15 sm:text-6xl">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-2 font-display text-2xl font-bold sm:text-3xl">
                  {person.role}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/75 sm:text-base">
                  {person.benefit}
                </p>
                <blockquote className="mt-6 border-l-2 border-accent pl-4 text-base font-medium text-white/95 italic sm:text-lg">
                  “{person.query}”
                </blockquote>
              </div>
            </div>
          </motion.article>
        ))}
      </div>

      <p className="mx-auto max-w-6xl px-6 py-12 text-center text-sm text-muted italic">
        Built for officers who need answers, not GIS software.
      </p>
    </section>
  )
}
