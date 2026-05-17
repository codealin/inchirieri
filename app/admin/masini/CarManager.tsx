'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { formatCurrency } from '@/lib/pricing'
import { createCar, updateCar, deleteCar, type CarFormData } from '@/app/admin/actions'
import type { Car } from '@/types/database'

const EMPTY_FORM: CarFormData = {
  name: '',
  engine: '',
  transmission: '',
  fuel_type: '',
  price_per_day: 0,
  image_url: '',
  available: true,
  description: '',
}

interface CarManagerProps {
  initialCars: Car[]
}

export function CarManager({ initialCars }: CarManagerProps) {
  const [cars, setCars] = useState(initialCars)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCar, setEditingCar] = useState<Car | null>(null)
  const [form, setForm] = useState<CarFormData>(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  useEffect(() => {
    setCars(initialCars)
  }, [initialCars])

  function openAddDialog() {
    setEditingCar(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setDialogOpen(true)
  }

  function openEditDialog(car: Car) {
    setEditingCar(car)
    setForm({
      name: car.name,
      engine: car.engine ?? '',
      transmission: car.transmission ?? '',
      fuel_type: car.fuel_type ?? '',
      price_per_day: car.price_per_day,
      image_url: car.image_url ?? '',
      available: car.available,
      description: car.description ?? '',
    })
    setFormError('')
    setDialogOpen(true)
  }

  function handleFormChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value, type } = e.target
    setForm((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : name === 'price_per_day'
          ? parseFloat(value) || 0
          : value,
    }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')

    if (!form.name.trim()) {
      setFormError('Numele mașinii este obligatoriu.')
      return
    }
    if (form.price_per_day <= 0) {
      setFormError('Prețul pe zi trebuie să fie mai mare decât 0.')
      return
    }

    startTransition(async () => {
      const result = editingCar
        ? await updateCar(editingCar.id, form)
        : await createCar(form)

      if (result?.error) {
        setFormError(result.error)
        return
      }

      setDialogOpen(false)
      router.refresh()
    })
  }

  function handleDelete(car: Car) {
    if (!confirm(`Ștergi mașina "${car.name}"? Această acțiune este ireversibilă.`)) return

    startTransition(async () => {
      await deleteCar(car.id)
      router.refresh()
    })
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Mașini</h1>
        <Button onClick={openAddDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Adaugă mașină
        </Button>
      </div>

      {cars.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground border rounded-lg bg-white">
          <p>Nu există mașini adăugate.</p>
          <Button onClick={openAddDialog} variant="outline" className="mt-4">
            Adaugă prima mașină
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Mașină</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Motor</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Transmisie</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Preț / zi</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {cars.map((car) => (
                <tr key={car.id} className="border-b last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{car.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{car.engine ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{car.transmission ?? '—'}</td>
                  <td className="px-4 py-3 font-medium">{formatCurrency(car.price_per_day)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={car.available ? 'default' : 'secondary'}>
                      {car.available ? 'Disponibilă' : 'Indisponibilă'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(car)}
                        className="gap-1"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Editează
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(car)}
                        className="gap-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Șterge
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCar ? 'Editează mașina' : 'Adaugă mașină nouă'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nume mașină *</Label>
              <Input
                id="name"
                name="name"
                value={form.name}
                onChange={handleFormChange}
                placeholder="Skoda Octavia 2020"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="engine">Motor</Label>
                <Input
                  id="engine"
                  name="engine"
                  value={form.engine}
                  onChange={handleFormChange}
                  placeholder="2.0 Diesel"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fuel_type">Combustibil</Label>
                <Input
                  id="fuel_type"
                  name="fuel_type"
                  value={form.fuel_type}
                  onChange={handleFormChange}
                  placeholder="Diesel"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="transmission">Transmisie</Label>
                <Input
                  id="transmission"
                  name="transmission"
                  value={form.transmission}
                  onChange={handleFormChange}
                  placeholder="Manuala 5+1"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="price_per_day">Preț / zi (RON) *</Label>
                <Input
                  id="price_per_day"
                  name="price_per_day"
                  type="number"
                  min="1"
                  step="1"
                  value={form.price_per_day || ''}
                  onChange={handleFormChange}
                  placeholder="120"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="image_url">URL imagine</Label>
              <Input
                id="image_url"
                name="image_url"
                value={form.image_url}
                onChange={handleFormChange}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Descriere</Label>
              <Textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleFormChange}
                placeholder="Detalii suplimentare..."
                rows={2}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="available"
                name="available"
                type="checkbox"
                checked={form.available}
                onChange={handleFormChange}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="available">Mașina este disponibilă</Label>
            </div>

            {formError && (
              <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{formError}</p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={isPending}
              >
                Anulează
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : editingCar ? 'Salvează' : 'Adaugă'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
