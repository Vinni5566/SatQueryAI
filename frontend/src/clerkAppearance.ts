import type { Appearance } from '@clerk/types'

/** Clerk UI tuned to SatQuery navy / accent tokens */
export const clerkAppearance: Appearance = {
  variables: {
    colorPrimary: '#0B1F3A',
    colorText: '#0B1F3A',
    colorTextSecondary: '#64748B',
    colorBackground: '#FFFFFF',
    colorInputBackground: '#FFFFFF',
    colorInputText: '#0B1F3A',
    borderRadius: '0.5rem',
    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
  },
  elements: {
    card: 'shadow-none border border-slate-200',
    headerTitle: 'text-ink font-bold',
    headerSubtitle: 'text-muted',
    socialButtonsBlockButton: 'border border-slate-200',
    formButtonPrimary:
      'bg-[#0B1F3A] hover:bg-[#0B1F3A]/90 text-white normal-case',
    footerActionLink: 'text-[#0B1F3A] hover:text-[#0B1F3A]',
  },
}
