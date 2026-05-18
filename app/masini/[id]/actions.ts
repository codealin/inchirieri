'use server'

import { redirect } from 'next/navigation'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { calculateTotalPrice } from '@/lib/pricing'
import { sendReservationEmails } from '@/lib/email'

interface ReservationData {
  carId: string
  startDate: string
  endDate: string
  customerName: string
  customerPhone: string
  customerEmail: string
  notes: string
}

export async function submitReservation(
  data: ReservationData
): Promise<{ error: string } | undefined> {
  const { carId, startDate, endDate, customerName, customerPhone, customerEmail, notes } = data

  if (!customerName.trim() || !customerPhone.trim()) {
    return { error: 'Numele și telefonul sunt obligatorii.' }
  }

  const supabase = createSupabaseAdminClient()

  // Fetch car server-side — pricePerDay nu vine de la client
  const { data: car } = await supabase
    .from('cars')
    .select('price_per_day, name')
    .eq('id', carId)
    .single()

  if (!car) {
    return { error: 'Mașina nu a fost găsită.' }
  }

  // Check for overlapping approved/pending reservations
  const { data: conflicts } = await supabase
    .from('reservations')
    .select('id')
    .eq('car_id', carId)
    .in('status', ['pending', 'approved'])
    .lte('start_date', endDate)
    .gte('end_date', startDate)

  if (conflicts && conflicts.length > 0) {
    return { error: 'Mașina nu este disponibilă în intervalul selectat. Te rugăm să alegi alte date.' }
  }

  const totalPrice = calculateTotalPrice(
    new Date(startDate),
    new Date(endDate),
    car.price_per_day
  )

  const { error } = await supabase.from('reservations').insert({
    car_id: carId,
    customer_name: customerName.trim(),
    customer_phone: customerPhone.trim(),
    customer_email: customerEmail.trim() || null,
    start_date: startDate,
    end_date: endDate,
    total_price: totalPrice,
    status: 'pending',
    notes: notes.trim() || null,
  })

  if (error) {
    return { error: 'Eroare la salvarea rezervării. Încearcă din nou sau sună-ne direct.' }
  }

  try {
    await sendReservationEmails({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim(),
      carName: car.name,
      startDate,
      endDate,
      totalPrice,
      notes: notes.trim(),
    })
  } catch {
    // Email failure doesn't block the reservation
  }

  redirect('/rezervare-confirmata')
}
