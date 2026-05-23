export const dynamic = 'force-dynamic'

import { AdminShell } from '@/components/admin/AdminShell'
import { createSupabaseAdminClient } from '@/lib/supabase'
import {
  DEFAULT_TRACTARI_CONFIG,
  DEFAULT_VEHICLE_TYPES,
  type TractariConfig,
  type VehicleType,
} from '@/lib/tractari-pricing'
import { PretConfigForm } from './PretConfigForm'

async function getPageData(): Promise<{ config: TractariConfig; vehicleTypes: VehicleType[] }> {
  try {
    const supabase = createSupabaseAdminClient()
    const [{ data: configData }, { data: typesData }] = await Promise.all([
      supabase.from('tractari_config').select('*').eq('id', 1).single(),
      supabase.from('tractari_vehicle_types').select('*').order('position'),
    ])

    const config: TractariConfig = configData
      ? {
          price_per_km: Number(configData.price_per_km),
          local_fee: Number(configData.local_fee),
          base_fee: Number(configData.base_fee),
          base_fee_min_km: configData.base_fee_min_km,
          long_distance_km: configData.long_distance_km,
          schedule_label: configData.schedule_label,
        }
      : DEFAULT_TRACTARI_CONFIG

    const vehicleTypes: VehicleType[] = (typesData ?? []).map((t) => ({
      id: t.id,
      label: t.label,
      local_fee: Number(t.local_fee),
      per_km: Number(t.per_km),
      highlight: t.highlight,
      position: t.position,
    }))

    return { config, vehicleTypes: vehicleTypes.length ? vehicleTypes : DEFAULT_VEHICLE_TYPES }
  } catch {
    return { config: DEFAULT_TRACTARI_CONFIG, vehicleTypes: DEFAULT_VEHICLE_TYPES }
  }
}

export default async function PreturiPage() {
  const { config, vehicleTypes } = await getPageData()

  return (
    <AdminShell activeSection="preturi">
      <div className="p-6 max-w-2xl">
        <h1 className="text-2xl font-bold mb-1">Prețuri tractări</h1>
        <p className="text-muted-foreground mb-8">
          Modificările se aplică imediat pe pagina publică /tractari.
        </p>
        <PretConfigForm config={config} vehicleTypes={vehicleTypes} />
      </div>
    </AdminShell>
  )
}
