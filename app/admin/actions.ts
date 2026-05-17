'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseAdminClient } from '@/lib/supabase'

// ── Reservation actions ──────────────────────────────────────────────────────

export async function approveReservation(id: string) {
  const supabase = createSupabaseAdminClient()
  await supabase.from('reservations').update({ status: 'approved' }).eq('id', id)
  revalidatePath('/admin/dashboard')
}

export async function rejectReservation(id: string) {
  const supabase = createSupabaseAdminClient()
  await supabase.from('reservations').update({ status: 'rejected' }).eq('id', id)
  revalidatePath('/admin/dashboard')
}

export async function deleteReservation(id: string) {
  const supabase = createSupabaseAdminClient()
  await supabase.from('reservations').delete().eq('id', id)
  revalidatePath('/admin/dashboard')
}

export async function updateReservationDates(
  id: string,
  startDate: string,
  endDate: string
) {
  const supabase = createSupabaseAdminClient()
  await supabase
    .from('reservations')
    .update({ start_date: startDate, end_date: endDate })
    .eq('id', id)
  revalidatePath('/admin/dashboard')
}

// ── Car actions ──────────────────────────────────────────────────────────────

export interface CarFormData {
  name: string
  engine: string
  transmission: string
  fuel_type: string
  price_per_day: number
  image_url: string
  available: boolean
  description: string
}

export async function createCar(data: CarFormData) {
  const supabase = createSupabaseAdminClient()
  const { error } = await supabase.from('cars').insert({
    ...data,
    engine: data.engine || null,
    transmission: data.transmission || null,
    fuel_type: data.fuel_type || null,
    image_url: data.image_url || null,
    description: data.description || null,
  })
  if (error) return { error: error.message }
  revalidatePath('/admin/masini')
  revalidatePath('/')
}

export async function updateCar(id: string, data: CarFormData) {
  const supabase = createSupabaseAdminClient()
  const { error } = await supabase
    .from('cars')
    .update({
      ...data,
      engine: data.engine || null,
      transmission: data.transmission || null,
      fuel_type: data.fuel_type || null,
      image_url: data.image_url || null,
      description: data.description || null,
    })
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/masini')
  revalidatePath('/')
}

export async function deleteCar(id: string) {
  const supabase = createSupabaseAdminClient()
  await supabase.from('cars').delete().eq('id', id)
  revalidatePath('/admin/masini')
  revalidatePath('/')
}
