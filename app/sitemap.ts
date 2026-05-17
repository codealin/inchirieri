import type { MetadataRoute } from 'next'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { SITE_URL } from '@/lib/config'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createSupabaseAdminClient()
  const { data: cars } = await supabase.from('cars').select('id, created_at').eq('available', true)

  const carPages: MetadataRoute.Sitemap = (cars ?? []).map((car) => ({
    url: `${SITE_URL}/masini/${car.id}`,
    lastModified: new Date(car.created_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...carPages,
  ]
}
