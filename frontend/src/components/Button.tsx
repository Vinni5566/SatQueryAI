import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  children: ReactNode
}

const variantClass: Record<ButtonVariant, string> = {
  // Navy fill + white label in both themes (matches wireframe Sign in).
  // Dark primary uses accent fill + navy label for contrast on dark pages.
  primary:
    'bg-navy text-white border border-transparent hover:opacity-90 dark:bg-accent dark:text-navy',
  secondary:
    'bg-transparent text-ink border-2 border-navy hover:bg-surface dark:border-accent dark:text-accent',
  ghost:
    'bg-transparent text-ink border border-transparent hover:bg-surface',
}

export function Button({
  variant = 'primary',
  className = '',
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-opacity disabled:opacity-50 ${variantClass[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
