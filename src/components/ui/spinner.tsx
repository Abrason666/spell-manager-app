import { cn } from '@/lib/utils'

interface SpinnerProps {
  className?: string
}

export function Spinner({ className }: SpinnerProps) {
  return (
    <div
      className={cn('h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent', className)}
    />
  )
}
