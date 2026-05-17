export const dynamic = 'force-dynamic'

import { AdminShell } from '@/components/admin/AdminShell'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { CarManager } from './CarManager'

export default async function MasiniPage() {
  const supabase = createSupabaseAdminClient()
  const { data: carsData } = await supabase
    .from('cars')
    .select('*')
    .order('created_at', { ascending: true })

  return (
    <AdminShell activeSection="masini">
      <div className="p-6">
        <CarManager initialCars={carsData ?? []} />
      </div>
    </AdminShell>
  )
}
