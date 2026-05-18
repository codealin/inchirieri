export const dynamic = 'force-dynamic'

import { format } from 'date-fns'
import { ro } from 'date-fns/locale'
import { AdminShell } from '@/components/admin/AdminShell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { markContactResolved, deleteContactRequest } from '@/app/admin/actions'
import type { ContactRequest } from '@/types/database'

export default async function ContactPage() {
  const supabase = createSupabaseAdminClient()
  const { data } = await supabase
    .from('contact_requests')
    .select('*')
    .order('created_at', { ascending: false })

  const requests: ContactRequest[] = data ?? []
  const unresolvedCount = requests.filter((r) => !r.resolved).length

  return (
    <AdminShell activeSection="contact">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Formulare contact</h1>
            {unresolvedCount > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                {unresolvedCount} nerezolvate
              </p>
            )}
          </div>
        </div>

        {requests.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            Nu există formulare de contact trimise.
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
                        <a
                          href={`tel:${req.phone}`}
                          className="text-primary hover:underline font-medium"
                        >
                          {req.phone}
                        </a>
                        {req.email && (
                          <a
                            href={`mailto:${req.email}`}
                            className="hover:underline"
                          >
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
