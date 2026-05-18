export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { format } from 'date-fns'
import { ro } from 'date-fns/locale'
import { AdminShell } from '@/components/admin/AdminShell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmFormButton } from '@/components/admin/ConfirmFormButton'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { markContactResolved, deleteContactRequest } from '@/app/admin/actions'
import type { ContactRequest } from '@/types/database'

type ContactType = 'toate' | 'inchirieri' | 'tractari'
type ResolvedTab = 'nerezolvate' | 'rezolvate'

interface PageProps {
  searchParams: Promise<{ tab?: string; tip?: string }>
}

const TYPE_LABEL: Record<string, string> = {
  inchirieri: 'Închirieri',
  tractari: 'Tractări',
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
    { label: 'Toate', value: 'toate', count: null },
    { label: 'Închirieri', value: 'inchirieri', count: resolvedTab === 'nerezolvate' ? unresolvedInchirieri : null },
    { label: 'Tractări', value: 'tractari', count: resolvedTab === 'nerezolvate' ? unresolvedTractari : null },
  ]

  function href(newTip: string, newTab?: string) {
    const t = newTab ?? resolvedTab
    return `/admin/contact?tab=${t}&tip=${newTip}`
  }

  return (
    <AdminShell activeSection="contact">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Formulare contact</h1>

        {/* Rezolvate / Nerezolvate tabs */}
        <div className="flex gap-2 mb-4 border-b pb-0">
          {resolvedTabs.map((t) => (
            <Link
              key={t.value}
              href={href(typeFilter, t.value)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
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

        {/* Inchirieri / Tractari filter */}
        <div className="flex gap-2 mb-6">
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

        {/* List */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            Nu există formulare {resolvedTab === 'nerezolvate' ? 'nerezolvate' : 'rezolvate'}
            {typeFilter !== 'toate' ? ` pentru ${TYPE_LABEL[typeFilter]}` : ''}.
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((req) => {
              const resolve = markContactResolved.bind(null, req.id)
              const remove = deleteContactRequest.bind(null, req.id)

              return (
                <div
                  key={req.id}
                  className={`bg-white border rounded-xl p-5 shadow-sm ${
                    !req.resolved ? 'border-slate-300' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold">{req.name}</span>
                        <Badge variant={req.resolved ? 'secondary' : 'default'}>
                          {req.resolved ? 'Rezolvat' : 'Nou'}
                        </Badge>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            req.type === 'inchirieri'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {TYPE_LABEL[req.type] ?? req.type}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(req.created_at), 'd MMM yyyy, HH:mm', { locale: ro })}
                        </span>
                      </div>
                      <div className="flex gap-4 text-sm text-muted-foreground mb-3 flex-wrap">
                        <a href={`tel:${req.phone}`} className="text-primary hover:underline font-medium">
                          {req.phone}
                        </a>
                        {req.email && (
                          <a href={`mailto:${req.email}`} className="hover:underline">
                            {req.email}
                          </a>
                        )}
                      </div>
                      <p className="text-sm text-slate-700 bg-slate-50 rounded-lg px-3 py-2 whitespace-pre-wrap">
                        {req.message}
                      </p>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      {!req.resolved && (
                        <form action={resolve}>
                          <Button type="submit" size="sm" variant="default">
                            Rezolvat
                          </Button>
                        </form>
                      )}
                      <ConfirmFormButton
                        action={remove}
                        message={`Ștergi cererea de contact de la ${req.name}? Acțiune ireversibilă.`}
                      >
                        Șterge
                      </ConfirmFormButton>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AdminShell>
  )
}
