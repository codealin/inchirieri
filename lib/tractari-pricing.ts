export interface TractariConfig {
  price_per_km: number
  local_fee: number
  base_fee: number
  base_fee_min_km: number    // one-way km de la care se aplică taxa de pornire
  long_distance_km: number   // one-way km de la care taxa dispare și se negociază
  schedule_label: string
}

export const DEFAULT_TRACTARI_CONFIG: TractariConfig = {
  price_per_km: 2.5,
  local_fee: 100,
  base_fee: 50,
  base_fee_min_km: 25,
  long_distance_km: 100,
  schedule_label: 'Luni–Sâmbătă, 08:00–20:00',
}

export function calcBaseFee(oneWayKm: number, config: TractariConfig): number {
  if (oneWayKm === 0) return 0                          // local — se folosește local_fee
  if (oneWayKm < config.base_fee_min_km) return 0      // distanță scurtă, fără taxă
  if (oneWayKm >= config.long_distance_km) return 0    // distanță mare, se negociază
  return config.base_fee
}

export function calcTractariTotal(oneWayKm: number, config: TractariConfig): number {
  if (oneWayKm === 0) return config.local_fee
  return calcBaseFee(oneWayKm, config) + oneWayKm * 2 * config.price_per_km
}

export function isLongDistance(oneWayKm: number, config: TractariConfig): boolean {
  return oneWayKm >= config.long_distance_km
}
