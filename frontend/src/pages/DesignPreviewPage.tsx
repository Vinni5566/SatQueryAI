import logoDark from '../assets/logos/satquery-logo-dark.png'
import logoLight from '../assets/logos/satquery-logo-light.png'
import { Button } from '../components/Button'
import { Navbar } from '../components/Navbar'
import { ThemeToggle } from '../components/ThemeToggle'
import { useTheme } from '../ThemeContext'

const SWATCHES = [
  { name: 'bg', className: 'bg-bg border border-border' },
  { name: 'surface', className: 'bg-surface border border-border' },
  { name: 'navy', className: 'bg-navy' },
  { name: 'accent', className: 'bg-accent' },
  { name: 'water', className: 'bg-water' },
  { name: 'change', className: 'bg-change' },
  { name: 'builtup', className: 'bg-builtup' },
] as const

export function DesignPreviewPage() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="min-h-screen bg-bg text-ink">
      <Navbar />
      <main className="mx-auto max-w-6xl space-y-12 px-6 py-10">
        <section>
          <h1 className="text-2xl font-bold text-ink">Design preview</h1>
          <p className="mt-2 text-sm text-muted">
            Flip theme to check tokens, buttons, and the brand logo images.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-ink">Theme</h2>
          <div className="flex flex-wrap items-center gap-4">
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            <p className="text-sm text-muted">
              Currently{' '}
              <span className="font-medium text-ink">{theme}</span> mode.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {SWATCHES.map((swatch) => (
              <div key={swatch.name} className="flex flex-col items-center gap-1.5">
                <div
                  className={`h-12 w-12 rounded-lg ${swatch.className}`}
                  title={swatch.name}
                />
                <span className="text-xs text-muted">{swatch.name}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-ink">Buttons</h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-ink">Brand logo</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-4 rounded-lg border-2 border-border bg-white px-4 py-4">
              <img
                src={logoLight}
                alt="Logo on light background"
                className="h-16 w-16 object-contain"
              />
              <div>
                <div className="text-sm font-medium text-navy">Light</div>
                <div className="text-xs text-muted">satquery-logo-light.png</div>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-lg border-2 border-border bg-[#050a14] px-4 py-4">
              <img
                src={logoDark}
                alt="Logo on dark background"
                className="h-16 w-16 object-contain"
              />
              <div>
                <div className="text-sm font-medium text-white">Dark</div>
                <div className="text-xs text-slate-400">satquery-logo-dark.png</div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
