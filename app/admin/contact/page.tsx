export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { AdminShell } from '@/components/admin/AdminShell'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { ContactList } from '@/components/admin/ContactList'
import type { ContactRequest } from '@/types/database'

type ContactType = 'toate' | 'inchirieri' | 'tractari'
type ResolvedTab = 'nerezolvate' | 'rezolvate'

interface PageProps {
  searchParams: Promise<{ tab?: string; tip?: string }>
}

export default async function ContactPage({ searchParams }: PageProps) {
  const { tab, tip } = await searchParams
  const resolvedTab: ResolvedTab = tab === 'rezolvate' ? 'rezolvate' : 'nerezolvate'
  const typeFilter: ContactType =
    tip === 'inchirieri' ? 'inchirieri' : tip === 'tractari' ? 'tractari' : 'toate'

  const supabase = createSupabaseAdminClient()

  const [{ data: unresolved }, { data: resolved }] = await Promise.all([
    supabase
      .from('contact_requests')
      .select('*')
      .eq('resolved', false)
      .order('created_at', { ascending: false }),
    supabase
      .from('contact_requests')
      .select('*')
      .eq('resolved', true)
      .order('created_at', { ascending: false }),
  ])

  const unresolvedList: ContactRequest[] = unresolved ?? []
  const resolvedList: ContactRequest[] = resolved ?? []

  const unresolvedInchirieri = unresolvedList.filter((r) => r.type === 'inchirieri').length
  const unresolvedTractari = unresolvedList.filter((r) => r.type === 'tractari').length

  const baseList = resolvedTab === 'nerezolvate' ? unresolvedList : resolvedList
  const filtered =
    typeFilter === 'toate' ? baseList : baseList.filter((r) => r.type === typeFilter)

  const resolvedTabs = [
    { label: 'Nerezolvate', value: 'nerezolvate', count: unresolvedList.length },
    { label: 'Rezolvate', value: 'rezolvate', count: resolvedList.length },
  ]

  const typeTabs = [
    { label: 'Toate', value: 'toate', count: null as number | null },
    {
      label: 'Închirieri',
      value: 'inchirieri',
      count: resolvedTab === 'nerezolvate' ? unresolvedInchirieri : null,
    },
    {
      label: 'Tractări',
      value: 'tractari',
      count: resolvedTab === 'nerezolvate' ? unresolvedTractari : null,
    },
  ]

  function href(newTip: string, newTab?: string) {
    const t = newTab ?? resolvedTab
    return `/admin/contact?tab=${t}&tip=${newTip}`
  }

  return (
    <AdminShell activeSection="contact">
      <div className="p-4 md:p-6">
        <h1 className="text-2xl font-bold mb-5">Formulare contact</h1>

        {/* Rezolvate / Nerezolvate tabs */}
        <div className="flex gap-2 mb-4 border-b pb-0 overflow-x-auto">
          {resolvedTabs.map((t) => (
            <Link
              key={t.value}
              href={href(typeFilter, t.value)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap ${
                resolvedTab === t.value
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.label}
              <span className="ml-1.5 text-xs bg-muted px-1.5 py-0.5 rounded-full">
                {t.count}
              </span>
            </Link>
          ))}
        </div>

        {/* Inchirieri / Tractari filter pills */}
        <div className="flex gap-2 mb-5">
          {typeTabs.map((t) => (
            <Link
              key={t.value}
              href={href(t.value)}
              className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                typeFilter === t.value
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'text-muted-foreground border-slate-200 hover:border-slate-400'
              }`}
            >
              {t.label}
              {t.count !== null && t.count > 0 && (
                <span className="ml-1 opacity-80">({t.count})</span>
              )}
            </Link>
          ))}
        </div>

        <ContactList requests={filtered} />
      </div>
    </AdminShell>
  )
}
