import { twMerge } from 'tailwind-merge'
import { tv } from 'tailwind-variants'

const surface = tv({
  base: 'border border-border bg-panel',
  variants: {
    elevation: {
      md: 'shadow-panel',
      lg: 'shadow-panel',
      xl: 'shadow-floating',
      overlay: 'shadow-floating'
    },
    radius: {
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl'
    },
    padding: {
      none: '',
      sm: 'p-1',
      md: 'p-2',
      lg: 'p-3'
    }
  },
  defaultVariants: {
    elevation: 'lg',
    radius: 'lg',
    padding: 'sm'
  }
})

export function useSurfaceUI(options?: {
  elevation?: 'md' | 'lg' | 'xl' | 'overlay'
  radius?: 'md' | 'lg' | 'xl'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  ui?: { base?: string }
}) {
  return {
    base: twMerge(surface(options), options?.ui?.base)
  }
}
