export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { format } from 'date-fns'
import { ro } from 'date-fns/locale'
import { AdminShell } from '@/components/admin/AdminShell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { markContactResolved, deleteContactRequest } from '@/app/admin/actions'
import type { ContactRequest } from '@/types/database'

interface PageProps {
  searchParams: Promise<{ tab?: string }>
}

export default async function ContactPage({ searchParams }: PageProps) {
  const { tab } = await searchParams
  const activeTab = tab === 'rezolvate' ? 'rezolvate' : 'nerezolvate'

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
  const requests = activeTab === 'nerezolvate' ? unresolvedList : resolvedList

  const tabs = [
    { label: 'Nerezolvate', value: 'nerezolvate', count: unresolvedList.length },
    { label: 'Rezolvate', value: 'rezolvate', count: resolvedList.length },
  ]

  return (
    <AdminShell activeSection="contact">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Formulare contact</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b pb-0">
          {tabs.map((t) => (
            <Link
              key={t.value}
              href={`/admin/contact?tab=${t.value}`}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
                activeTab === t.value
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

        {/* List */}
        {requests.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            Nu există formulare {activeTab === 'nerezolvate' ? 'nerezolvate' : 'rezolvate'}.
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => {
              const resolve = markContactResolved.bind(null, req.id)
              const remove = deleteContactRequest.bind(null, req.id)

              return (
                <div
                  key={req.id}
                  className={`bg-white border rounded-xl p-5 shadow-sm ${
                    !req.resolved ? 'border-green-300' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold">{req.name}</span>
                        <Badge variant={req.resolved ? 'secondary' : 'default'}>
                          {req.resolved ? 'Rezolvat' : 'Nou'}
                        </Badge>
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
                      <form action={remove}>
                        <Button type="submit" size="sm" variant="destructive">
                          Șterge
                        </Button>
                      </form>
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
