'use client'

import { useState, useTransition } from 'react'
import { format } from 'date-fns'
import { ro } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { markContactResolved, deleteContactRequest } from '@/app/admin/actions'
import type { ContactRequest } from '@/types/database'

const TYPE_LABEL: Record<string, string> = {
  inchirieri: 'Închirieri',
  tractari: 'Tractări',
}

interface Props {
  requests: ContactRequest[]
}

export function ContactList({ requests }: Props) {
  const [selected, setSelected] = useState<ContactRequest | null>(null)
  const [isPending, startTransition] = useTransition()

  if (requests.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Nu există formulare.
      </div>
    )
  }

  return (
    <>
      <div className="space-y-2">
        {requests.map((req) => (
          <button
            key={req.id}
            onClick={() => setSelected(req)}
            className="w-full text-left bg-white border rounded-xl p-4 shadow-sm hover:border-slate-300 active:bg-slate-50 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="font-semibold text-sm">{req.name}</span>
                  {!req.resolved && (
                    <Badge className="text-xs">Nou</Badge>
                  )}
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      req.type === 'inchirieri'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {TYPE_LABEL[req.type] ?? req.type}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{req.phone}</p>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{req.message}</p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                {format(new Date(req.created_at), 'd MMM', { locale: ro })}
              </span>
            </div>
          </button>
        ))}
      </div>

      <Dialog open={!!selected} onOpenChange={(v) => { if (!v && !isPending) setSelected(null) }}>
        <DialogContent className="max-w-sm w-[calc(100vw-2rem)]">
          <DialogHeader>
            <DialogTitle>Formular contact</DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold">{selected.name}</span>
                <Badge variant={selected.resolved ? 'secondary' : 'default'}>
                  {selected.resolved ? 'Rezolvat' : 'Nou'}
                </Badge>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    selected.type === 'inchirieri'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  {TYPE_LABEL[selected.type] ?? selected.type}
                </span>
              </div>

              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Telefon</span>
                  <a
                    href={`tel:${selected.phone}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {selected.phone}
                  </a>
                </div>
                {selected.email && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Email</span>
                    <a
                      href={`mailto:${selected.email}`}
                      className="text-primary text-xs hover:underline truncate max-w-[180px]"
                    >
                      {selected.email}
                    </a>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Data</span>
                  <span className="text-xs">
                    {format(new Date(selected.created_at), 'd MMM yyyy, HH:mm', { locale: ro })}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1.5">Mesaj</p>
                <p className="text-sm bg-slate-50 rounded-lg px-3 py-2.5 whitespace-pre-wrap leading-relaxed">
                  {selected.message}
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t">
                {!selected.resolved && (
                  <Button
                    onClick={() =>
                      startTransition(async () => {
                        await markContactResolved(selected.id)
                        setSelected(null)
                      })
                    }
                    disabled={isPending}
                    className="w-full"
                  >
                    {isPending ? 'Se procesează...' : 'Marchează rezolvat'}
                  </Button>
                )}
                <Button
                  variant="destructive"
                  disabled={isPending}
                  onClick={() => {
                    if (confirm(`Ștergi cererea de la ${selected.name}? Acțiune ireversibilă.`)) {
                      startTransition(async () => {
                        await deleteContactRequest(selected.id)
                        setSelected(null)
                      })
                    }
                  }}
                  className="w-full"
                >
                  Șterge
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
