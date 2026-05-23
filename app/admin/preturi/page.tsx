export const dynamic = 'force-dynamic'

import { AdminShell } from '@/components/admin/AdminShell'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { DEFAULT_TRACTARI_CONFIG, type TractariConfig } from '@/lib/tractari-pricing'
import { PretConfigForm } from './PretConfigForm'

async function getTractariConfig(): Promise<TractariConfig> {
  try {
    const supabase = createSupabaseAdminClient()
    const { data } = await supabase.from('tractari_config').select('*').eq('id', 1).single()
    if (!data) return DEFAULT_TRACTARI_CONFIG
    return {
      price_per_km: Number(data.price_per_km),
      local_fee: Number(data.local_fee),
      base_fee: Number(data.base_fee),
      base_fee_min_km: data.base_fee_min_km,
      long_distance_km: data.long_distance_km,
      schedule_label: data.schedule_label,
    }
  } catch {
    return DEFAULT_TRACTARI_CONFIG
  }
}

export default async function PreturiPage() {
  const config = await getTractariConfig()

  return (
    <AdminShell activeSection="preturi">
      <div className="p-6 max-w-2xl">
        <h1 className="text-2xl font-bold mb-1">Prețuri tractări</h1>
        <p className="text-muted-foreground mb-8">
          Modificările se aplică imediat pe pagina publică /tractari.
        </p>
        <PretConfigForm config={config} />
      </div>
    </AdminShell>
  )
}
