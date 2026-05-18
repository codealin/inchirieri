'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { sendContactEmail } from '@/lib/email'

export interface ContactFormState {
  success?: boolean
  error?: string
}

export async function submitContactForm(
  _prev: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const name = (formData.get('name') as string)?.trim()
  const phone = (formData.get('phone') as string)?.trim()
  const email = (formData.get('email') as string)?.trim() || null
  const message = (formData.get('message') as string)?.trim()

  if (!name || !phone || !message) {
    return { error: 'Completează toate câmpurile obligatorii.' }
  }

  const supabase = createSupabaseAdminClient()
  const { error } = await supabase.from('contact_requests').insert({
    name,
    phone,
    email,
    message,
  })

  if (error) {
    console.error('[contact_requests insert]', error.code, error.message, error.details)
    return { error: `Eroare: ${error.message}` }
  }

  try {
    await sendContactEmail({ name, phone, email: email ?? '', message })
  } catch {
    // email failure nu blochează salvarea
  }

  revalidatePath('/admin/contact')
  return { success: true }
}
