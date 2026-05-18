'use client'

import { Button } from '@/components/ui/button'

type ActionFn = (formData?: FormData) => void | Promise<void>

interface Props {
  action: ActionFn
  message: string
  children: React.ReactNode
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function ConfirmFormButton({
  action,
  message,
  children,
  variant = 'destructive',
  size = 'sm',
}: Props) {
  function handleSubmit(e: React.FormEvent) {
    if (!confirm(message)) {
      e.preventDefault()
    }
  }

  return (
    <form action={action} onSubmit={handleSubmit}>
      <Button type="submit" variant={variant} size={size}>
        {children}
      </Button>
    </form>
  )
}
