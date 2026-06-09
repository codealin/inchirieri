'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { slugify } from '@/lib/slug'

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
  slug: string
  engine: string
  transmission: string
  fuel_type: string
  price_per_day: number
  image_url: string
  available: boolean
  description: string
}

async function resolveUniqueSlug(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  base: string,
  excludeId?: string
): Promise<string> {
  let candidate = base
  let n = 2
  while (true) {
    let q = supabase.from('cars').select('id').eq('slug', candidate).limit(1)
    if (excludeId) q = q.neq('id', excludeId)
    const { data } = await q
    if (!data || data.length === 0) return candidate
    candidate = `${base}-${n++}`
  }
}

export async function createCar(data: CarFormData) {
  const supabase = createSupabaseAdminClient()

  const sanitized = slugify(data.slug)
  const slug = sanitized
    ? sanitized
    : await resolveUniqueSlug(supabase, slugify(data.name) || 'masina')

  const { data: created, error } = await supabase
    .from('cars')
    .insert({
      name: data.name,
      slug,
      engine: data.engine || null,
      transmission: data.transmission || null,
      fuel_type: data.fuel_type || null,
      price_per_day: data.price_per_day,
      image_url: data.image_url || null,
      available: data.available,
      description: data.description || null,
    })
    .select('id, slug')
    .single()

  if (error) {
    if (error.code === '23505') return { error: 'Acest slug este deja folosit de altă mașină.' }
    return { error: error.message }
  }
  revalidatePath('/admin/masini')
  revalidatePath('/')
  return { id: created.id as string, slug: created.slug as string }
}

export async function updateCar(id: string, data: CarFormData) {
  const supabase = createSupabaseAdminClient()

  const sanitized = slugify(data.slug)
  const slug = sanitized
    ? sanitized
    : await resolveUniqueSlug(supabase, slugify(data.name) || 'masina', id)

  const { error } = await supabase
    .from('cars')
    .update({
      name: data.name,
      slug,
      engine: data.engine || null,
      transmission: data.transmission || null,
      fuel_type: data.fuel_type || null,
      price_per_day: data.price_per_day,
      image_url: data.image_url || null,
      available: data.available,
      description: data.description || null,
    })
    .eq('id', id)

  if (error) {
    if (error.code === '23505') return { error: 'Acest slug este deja folosit de altă mașină.' }
    return { error: error.message }
  }
  revalidatePath('/admin/masini')
  revalidatePath('/')
  revalidatePath(`/masini/${slug}`)
}

export async function deleteCar(id: string) {
  const supabase = createSupabaseAdminClient()
  await supabase.from('cars').delete().eq('id', id)
  revalidatePath('/admin/masini')
  revalidatePath('/')
}

// ── Main car image actions ───────────────────────────────────────────────────

async function deleteFromStorage(supabase: ReturnType<typeof createSupabaseAdminClient>, imageUrl: string | null) {
  if (!imageUrl) return
  try {
    const url = new URL(imageUrl)
    const pathInBucket = url.pathname.replace('/storage/v1/object/public/cars/', '')
    // sterge doar fisierele din bucket-ul nostru (path incepe cu cars/ dupa replace)
    if (pathInBucket.startsWith('cars/')) {
      await supabase.storage.from('cars').remove([pathInBucket])
    }
  } catch {
    // ignora — fie nu e URL valid, fie e URL extern
  }
}

export async function uploadMainImage(carId: string, formData: FormData) {
  try {
    const supabase = createSupabaseAdminClient()
    const file = formData.get('file') as File
    if (!file || file.size === 0) return { error: 'Fișier invalid.' }

    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    const path = `cars/${carId}/main-${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('cars')
      .upload(path, file, { contentType: file.type || 'image/jpeg' })
    if (uploadError) return { error: uploadError.message }

    const { data: urlData } = supabase.storage.from('cars').getPublicUrl(path)
    const publicUrl = urlData?.publicUrl
    if (!publicUrl) return { error: 'Nu s-a putut obține URL-ul public.' }

    const { data: oldCar } = await supabase
      .from('cars')
      .select('image_url')
      .eq('id', carId)
      .single()

    const { error: dbError } = await supabase
      .from('cars')
      .update({ image_url: publicUrl })
      .eq('id', carId)
    if (dbError) return { error: dbError.message }

    await deleteFromStorage(supabase, oldCar?.image_url ?? null)

    revalidatePath('/')
    revalidatePath('/admin/masini')
    return { url: publicUrl }
  } catch (err) {
    console.error('[uploadMainImage] uncaught:', err)
    return { error: err instanceof Error ? err.message : String(err) }
  }
}

export async function removeMainImage(carId: string) {
  const supabase = createSupabaseAdminClient()

  const { data: car } = await supabase
    .from('cars')
    .select('image_url')
    .eq('id', carId)
    .single()

  await supabase.from('cars').update({ image_url: null }).eq('id', carId)
  await deleteFromStorage(supabase, car?.image_url ?? null)

  revalidatePath('/')
  revalidatePath('/admin/masini')
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
  try {
    const supabase = createSupabaseAdminClient()
    const file = formData.get('file') as File
    if (!file || file.size === 0) return { error: 'Fișier invalid.' }

    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    const path = `cars/${carId}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('cars')
      .upload(path, file, { contentType: file.type || 'image/jpeg' })
    if (uploadError) return { error: uploadError.message }

    const { data: urlData } = supabase.storage.from('cars').getPublicUrl(path)
    const publicUrl = urlData?.publicUrl
    if (!publicUrl) return { error: 'Nu s-a putut obține URL-ul public.' }

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
  } catch (err) {
    console.error('[uploadCarImage] uncaught:', err)
    return { error: err instanceof Error ? err.message : String(err) }
  }
}

// ── Tractari config actions ──────────────────────────────────────────────────

export interface TractariConfigInput {
  price_per_km: number
  local_fee: number
  base_fee: number
  base_fee_min_km: number
  long_distance_km: number
  schedule_label: string
}

export async function updateTractariConfig(data: TractariConfigInput) {
  const supabase = createSupabaseAdminClient()
  const { error } = await supabase
    .from('tractari_config')
    .upsert({ id: 1, ...data, updated_at: new Date().toISOString() })
  if (error) return { error: error.message }
  revalidatePath('/tractari')
  revalidatePath('/admin/preturi')
}

export interface VehicleTypeInput {
  id: number
  label: string
  local_fee: number
  per_km: number
  highlight: boolean
}

export async function updateVehicleTypes(types: VehicleTypeInput[]) {
  const supabase = createSupabaseAdminClient()
  for (const t of types) {
    const { error } = await supabase
      .from('tractari_vehicle_types')
      .update({ label: t.label, local_fee: t.local_fee, per_km: t.per_km, highlight: t.highlight })
      .eq('id', t.id)
    if (error) return { error: error.message }
  }
  revalidatePath('/tractari')
  revalidatePath('/admin/preturi')
}

// ── Contact request actions ──────────────────────────────────────────────────

export async function markContactResolved(id: string) {
  const supabase = createSupabaseAdminClient()
  await supabase.from('contact_requests').update({ resolved: true }).eq('id', id)
  revalidatePath('/admin/contact')
}

export async function deleteContactRequest(id: string) {
  const supabase = createSupabaseAdminClient()
  await supabase.from('contact_requests').delete().eq('id', id)
  revalidatePath('/admin/contact')
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
