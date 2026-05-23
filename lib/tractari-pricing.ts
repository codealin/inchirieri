export interface TractariConfig {
  price_per_km: number      // fallback dacă nu există tipuri vehicul
  local_fee: number         // fallback tarif local
  base_fee: number
  base_fee_min_km: number   // one-way km de la care se aplică taxa de pornire
  long_distance_km: number  // one-way km de la care taxa dispare și se negociază
  schedule_label: string
}

export interface VehicleType {
  id: number
  label: string
  local_fee: number
  per_km: number
  highlight: boolean
  position: number
}

export const DEFAULT_TRACTARI_CONFIG: TractariConfig = {
  price_per_km: 2.5,
  local_fee: 100,
  base_fee: 50,
  base_fee_min_km: 25,
  long_distance_km: 100,
  schedule_label: 'Luni–Sâmbătă, 08:00–20:00',
}

export const DEFAULT_VEHICLE_TYPES: VehicleType[] = [
  { id: 1, label: 'Autoturism',    local_fee: 150, per_km: 4,    highlight: false, position: 0 },
  { id: 2, label: 'Auto avariat',  local_fee: 200, per_km: 4,    highlight: true,  position: 1 },
  { id: 3, label: 'Autoutilitară', local_fee: 250, per_km: 5,    highlight: false, position: 2 },
]

export function calcBaseFee(oneWayKm: number, config: TractariConfig): number {
  if (oneWayKm === 0) return 0
  if (oneWayKm < config.base_fee_min_km) return 0
  if (oneWayKm >= config.long_distance_km) return 0
  return config.base_fee
}

export function calcTractariTotal(
  oneWayKm: number,
  config: TractariConfig,
  vehicleType?: VehicleType
): number {
  const perKm = vehicleType?.per_km ?? config.price_per_km
  const localFee = vehicleType?.local_fee ?? config.local_fee
  if (oneWayKm === 0) return localFee
  return calcBaseFee(oneWayKm, config) + oneWayKm * 2 * perKm
}

export function isLongDistance(oneWayKm: number, config: TractariConfig): boolean {
  return oneWayKm >= config.long_distance_km
}
