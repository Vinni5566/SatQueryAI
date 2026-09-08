import { Link } from 'react-router-dom'
import { SignedIn, SignedOut } from '@clerk/clerk-react'
import { Button } from '../components/Button'
import { Navbar } from '../components/Navbar'
import { ROUTES } from '../routes'

export function HomePage() {
  return (
    <div className="min-h-screen bg-bg text-ink">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            What do you need to know?
          </h1>
          <p className="mt-3 text-base text-muted">
            Sign in to pick a job, upload pictures, and ask in plain language.
          </p>

          <SignedOut>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link to={ROUTES.signIn}>
                <Button variant="secondary">Sign in</Button>
              </Link>
              <Link to={ROUTES.signUp}>
                <Button variant="primary">Sign up</Button>
              </Link>
            </div>
          </SignedOut>

          <SignedIn>
            <p className="mt-8 text-sm text-muted">
              You are signed in. Job picker comes next.
            </p>
            <div className="mt-4">
              <Link to={ROUTES.design}>
                <Button variant="secondary">Open design preview</Button>
              </Link>
            </div>
          </SignedIn>
        </div>

            <p className="mt-16 text-center text-xs text-muted">
              GeoTIFF preferred · Generic photo-chatbots are not used on pixels.
            </p>
      </main>
    </div>
  )
}
