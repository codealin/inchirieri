'use server'

import { redirect } from 'next/navigation'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { calculateTotalPrice } from '@/lib/pricing'

interface ReservationData {
  carId: string
  startDate: string
  endDate: string
  pricePerDay: number
  customerName: string
  customerPhone: string
  customerEmail: string
  notes: string
}

export async function submitReservation(
  data: ReservationData
): Promise<{ error: string } | undefined> {
  const { carId, startDate, endDate, pricePerDay, customerName, customerPhone, customerEmail, notes } = data

  if (!customerName.trim() || !customerPhone.trim()) {
    return { error: 'Numele și telefonul sunt obligatorii.' }
  }

  const supabase = createSupabaseAdminClient()

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
    pricePerDay
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

  redirect('/rezervare-confirmata')
}
