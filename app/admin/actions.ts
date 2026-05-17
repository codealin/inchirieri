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

// ── Car image actions ────────────────────────────────────────────────────────

export async function getCarImages(carId: string) {
  const supabase = createSupabaseAdminClient()
  const { data } = await supabase
    .from('car_images')
    .select('id, url, position')
    .eq('car_id', carId)
    .order('position', { ascending: true })
  return data ?? []
}

export async function addCarImage(carId: string, url: string) {
  const supabase = createSupabaseAdminClient()
  const { data: last } = await supabase
    .from('car_images')
    .select('position')
    .eq('car_id', carId)
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle()
  const position = (last?.position ?? -1) + 1
  const { data, error } = await supabase
    .from('car_images')
    .insert({ car_id: carId, url, position })
    .select()
    .single()
  if (error) return { error: error.message }
  revalidatePath('/')
  return data as { id: string; url: string; position: number }
}

export async function uploadCarImage(carId: string, formData: FormData) {
  const supabase = createSupabaseAdminClient()
  const file = formData.get('file') as File
  if (!file || file.size === 0) return { error: 'Fișier invalid.' }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const path = `cars/${carId}/${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('cars')
    .upload(path, file, { contentType: file.type })
  if (uploadError) return { error: uploadError.message }

  const { data: { publicUrl } } = supabase.storage.from('cars').getPublicUrl(path)

  const { data: last } = await supabase
    .from('car_images')
    .select('position')
    .eq('car_id', carId)
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle()
  const position = (last?.position ?? -1) + 1

  const { data, error: dbError } = await supabase
    .from('car_images')
    .insert({ car_id: carId, url: publicUrl, position })
    .select()
    .single()
  if (dbError) return { error: dbError.message }

  revalidatePath('/')
  return data as { id: string; url: string; position: number }
}

export async function deleteCarImage(imageId: string) {
  const supabase = createSupabaseAdminClient()

  const { data: img } = await supabase
    .from('car_images')
    .select('url')
    .eq('id', imageId)
    .single()

  await supabase.from('car_images').delete().eq('id', imageId)

  if (img?.url) {
    try {
      const url = new URL(img.url)
      const pathInBucket = url.pathname.replace('/storage/v1/object/public/cars/', '')
      await supabase.storage.from('cars').remove([pathInBucket])
    } catch {
      // ignore storage errors — row is already deleted
    }
  }

  revalidatePath('/')
}
