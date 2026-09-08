import { SignIn } from '@clerk/clerk-react'
import { Navbar } from '../components/Navbar'
import { clerkAppearance } from '../clerkAppearance'
import { ROUTES } from '../routes'

export function SignInPage() {
  return (
    <div className="min-h-screen bg-bg text-ink">
      <Navbar />
      <main className="mx-auto flex max-w-6xl flex-col items-center px-6 py-12">
        <SignIn
          routing="path"
          path={ROUTES.signIn}
          signUpUrl={ROUTES.signUp}
          fallbackRedirectUrl={ROUTES.home}
          appearance={clerkAppearance}
        />
        <p className="mt-6 max-w-sm text-center text-xs text-muted">
          Signing in sets an essential session cookie on this browser. You can
          change cookie preferences anytime.
        </p>
        <p className="mt-10 text-xs text-muted">
          Department of Space · Not an official ISRO product announcement.
        </p>
      </main>
    </div>
  )
}
