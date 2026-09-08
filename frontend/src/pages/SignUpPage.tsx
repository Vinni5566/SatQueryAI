import { SignUp } from '@clerk/clerk-react'
import { Navbar } from '../components/Navbar'
import { clerkAppearance } from '../clerkAppearance'
import { ROUTES } from '../routes'

export function SignUpPage() {
  return (
    <div className="min-h-screen bg-bg text-ink">
      <Navbar />
      <main className="mx-auto flex max-w-6xl flex-col items-center px-6 py-12">
        <SignUp
          routing="path"
          path={ROUTES.signUp}
          signInUrl={ROUTES.signIn}
          fallbackRedirectUrl={ROUTES.home}
          appearance={clerkAppearance}
        />
        <p className="mt-6 max-w-md rounded-lg border border-border bg-surface px-4 py-3 text-center text-xs text-muted">
          Google sign-up is the fastest path. Email accounts work for teams
          without Google.
        </p>
        <p className="mt-10 text-xs text-muted">
          Department of Space · Not an official ISRO product announcement.
        </p>
      </main>
    </div>
  )
}
