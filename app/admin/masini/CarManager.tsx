'use client'

import { useState, useEffect, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, Loader2, Upload, X, Images, Star } from 'lucide-react'
import Image from 'next/image'
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
import {
  createCar, updateCar, deleteCar,
  getCarImages, uploadCarImage, deleteCarImage,
  uploadMainImage, removeMainImage,
  type CarFormData,
} from '@/app/admin/actions'
import type { Car } from '@/types/database'

type CarImageEntry = { id: string; url: string; position: number }
type PendingFile = { file: File; previewUrl: string }

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
  const [carImages, setCarImages] = useState<CarImageEntry[]>([])
  const [uploadError, setUploadError] = useState('')
  const [isImagePending, startImageTransition] = useTransition()
  const [mainImageUrl, setMainImageUrl] = useState<string | null>(null)
  const [mainImageError, setMainImageError] = useState('')
  const [isMainPending, startMainTransition] = useTransition()
  // Pending files (add mode only — upload pe submit)
  const [pendingMain, setPendingMain] = useState<PendingFile | null>(null)
  const [pendingSecondary, setPendingSecondary] = useState<PendingFile[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mainInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  function clearPending() {
    if (pendingMain) URL.revokeObjectURL(pendingMain.previewUrl)
    pendingSecondary.forEach((p) => URL.revokeObjectURL(p.previewUrl))
    setPendingMain(null)
    setPendingSecondary([])
  }

  useEffect(() => {
    setCars(initialCars)
  }, [initialCars])

  function openAddDialog() {
    setEditingCar(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setCarImages([])
    setMainImageUrl(null)
    setMainImageError('')
    setUploadError('')
    clearPending()
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
    setCarImages([])
    setUploadError('')
    setMainImageUrl(car.image_url ?? null)
    setMainImageError('')
    clearPending()
    setDialogOpen(true)
    startImageTransition(async () => {
      const imgs = await getCarImages(car.id)
      setCarImages(imgs)
    })
  }

  function handleMainImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setMainImageError('')

    // Add mode: tine fisierul local, upload pe submit
    if (!editingCar) {
      if (pendingMain) URL.revokeObjectURL(pendingMain.previewUrl)
      setPendingMain({ file, previewUrl: URL.createObjectURL(file) })
      return
    }

    // Edit mode: upload imediat
    startMainTransition(async () => {
      try {
        const fd = new FormData()
        fd.append('file', file)
        const result = await uploadMainImage(editingCar.id, fd)
        if (!result || 'error' in result) {
          setMainImageError((result as { error: string } | null)?.error ?? 'Eroare la upload.')
          return
        }
        setMainImageUrl(result.url)
        setForm((prev) => ({ ...prev, image_url: result.url }))
      } catch (err) {
        setMainImageError(err instanceof Error ? err.message : 'Eroare neașteptată la upload.')
      }
    })
  }

  function handleRemoveMainImage() {
    // Add mode: scoate doar din pending
    if (!editingCar) {
      if (pendingMain) URL.revokeObjectURL(pendingMain.previewUrl)
      setPendingMain(null)
      return
    }
    if (!confirm('Ștergi fotografia principală?')) return
    startMainTransition(async () => {
      await removeMainImage(editingCar.id)
      setMainImageUrl(null)
      setForm((prev) => ({ ...prev, image_url: '' }))
    })
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    e.target.value = ''
    setUploadError('')

    // Add mode: tine fisierele local
    if (!editingCar) {
      setPendingSecondary((prev) => [
        ...prev,
        ...files.map((f) => ({ file: f, previewUrl: URL.createObjectURL(f) })),
      ])
      return
    }

    // Edit mode: upload imediat
    startImageTransition(async () => {
      try {
        for (const file of files) {
          const fd = new FormData()
          fd.append('file', file)
          const result = await uploadCarImage(editingCar.id, fd)
          if (!result || 'error' in result) {
            setUploadError((result as { error: string } | null)?.error ?? 'Eroare la upload.')
            return
          }
          setCarImages((prev) => [...prev, result])
        }
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : 'Eroare neașteptată la upload.')
      }
    })
  }

  function handleDeleteImage(imageId: string) {
    startImageTransition(async () => {
      await deleteCarImage(imageId)
      setCarImages((prev) => prev.filter((img) => img.id !== imageId))
    })
  }

  function handleRemovePendingSecondary(index: number) {
    setPendingSecondary((prev) => {
      const item = prev[index]
      if (item) URL.revokeObjectURL(item.previewUrl)
      return prev.filter((_, i) => i !== index)
    })
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
      try {
        if (editingCar) {
          const result = await updateCar(editingCar.id, form)
          if (result?.error) {
            setFormError(result.error)
            return
          }
        } else {
          // Create + upload pozele in cascada
          const result = await createCar(form)
          if (!result || 'error' in result) {
            setFormError((result as { error: string } | null)?.error ?? 'Eroare la crearea mașinii.')
            return
          }
          const newId = result.id

          if (pendingMain) {
            const fd = new FormData()
            fd.append('file', pendingMain.file)
            const r = await uploadMainImage(newId, fd)
            if (!r || 'error' in r) {
              setFormError(`Mașina a fost creată, dar poza principală a eșuat: ${'error' in (r ?? {}) ? (r as { error: string }).error : 'eroare necunoscută'}`)
              clearPending()
              setDialogOpen(false)
              router.refresh()
              return
            }
          }

          for (const item of pendingSecondary) {
            const fd = new FormData()
            fd.append('file', item.file)
            const r = await uploadCarImage(newId, fd)
            if (!r || 'error' in r) {
              setFormError(`O poză secundară a eșuat: ${'error' in (r ?? {}) ? (r as { error: string }).error : 'eroare necunoscută'}`)
              clearPending()
              setDialogOpen(false)
              router.refresh()
              return
            }
          }

          clearPending()
        }

        setDialogOpen(false)
        router.refresh()
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        setFormError(`Eroare neașteptată: ${msg}`)
        console.error('[CarManager handleSubmit]', err)
      }
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
        <div className="space-y-3">
          {cars.map((car) => (
            <div
              key={car.id}
              className="bg-white border rounded-xl p-4 flex items-center gap-3 shadow-sm"
            >
              {car.image_url ? (
                <div className="relative w-16 h-12 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                  <Image
                    src={car.image_url}
                    alt={car.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
              ) : (
                <div className="w-16 h-12 rounded-lg shrink-0 bg-slate-100 flex items-center justify-center">
                  <span className="text-slate-400 text-xs">—</span>
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="font-semibold text-sm truncate">{car.name}</span>
                  <Badge variant={car.available ? 'default' : 'secondary'} className="shrink-0 text-xs">
                    {car.available ? 'Disponibilă' : 'Indisponibilă'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {[car.engine, car.transmission].filter(Boolean).join(' · ') || '—'}
                </p>
                <p className="text-sm font-semibold mt-0.5">{formatCurrency(car.price_per_day)}/zi</p>
              </div>

              <div className="flex flex-col gap-1.5 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEditDialog(car)}
                  className="h-8 w-8 p-0"
                  title="Editează"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(car)}
                  className="h-8 w-8 p-0"
                  title="Șterge"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
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

            {/* Main image — disponibil in ambele moduri */}
            <div className="space-y-3 pt-3 border-t">
              <Label className="flex items-center gap-1.5">
                <Star className="h-4 w-4" />
                Fotografie principală
                <span className="text-xs font-normal text-muted-foreground">
                  — apare pe card și pe pagina detaliu
                </span>
              </Label>

              <input
                ref={mainInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleMainImageChange}
              />

              {(() => {
                const displayUrl = editingCar ? mainImageUrl : pendingMain?.previewUrl ?? null
                if (!displayUrl) {
                  return (
                    <button
                      type="button"
                      onClick={() => mainInputRef.current?.click()}
                      disabled={isMainPending}
                      className="w-full aspect-[16/10] border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-slate-50 text-slate-500 transition-colors disabled:opacity-50"
                    >
                      {isMainPending ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : (
                        <>
                          <Upload className="h-6 w-6" />
                          <span className="text-sm font-medium">Încarcă poza principală</span>
                        </>
                      )}
                    </button>
                  )
                }
                return (
                  <div className="relative w-full aspect-[16/10] rounded-lg overflow-hidden border group">
                    <Image
                      src={displayUrl}
                      alt="Fotografie principală"
                      fill
                      className="object-contain p-2"
                      sizes="500px"
                      unoptimized={!editingCar /* pending blob URL */}
                    />
                    {isMainPending && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-white" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => mainInputRef.current?.click()}
                        disabled={isMainPending}
                        className="gap-1.5 text-xs shadow"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        Înlocuiește
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={handleRemoveMainImage}
                        disabled={isMainPending}
                        className="shadow"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )
              })()}

              {mainImageError && (
                <p className="text-xs text-red-600 bg-red-50 p-2 rounded">{mainImageError}</p>
              )}
            </div>

            {/* Additional images — disponibile in ambele moduri */}
            <div className="space-y-3 pt-3 border-t">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-1.5">
                  <Images className="h-4 w-4" />
                  Fotografii suplimentare
                </Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isImagePending}
                  className="gap-1.5 text-xs"
                >
                  {isImagePending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Upload className="h-3.5 w-3.5" />
                  )}
                  {isImagePending ? 'Se încarcă...' : 'Încarcă poze'}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {carImages.length === 0 && pendingSecondary.length === 0 && !isImagePending && (
                <p className="text-xs text-muted-foreground py-2 text-center border border-dashed rounded-lg">
                  Nicio fotografie suplimentară. Apasă "Încarcă poze" pentru a adăuga.
                </p>
              )}

              {(carImages.length > 0 || pendingSecondary.length > 0) && (
                <div className="flex gap-2 flex-wrap">
                  {carImages.map((img) => (
                    <div
                      key={img.id}
                      className="relative group w-24 h-16 rounded-lg overflow-hidden border bg-slate-100 shrink-0"
                    >
                      <Image
                        src={img.url}
                        alt="foto"
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(img.id)}
                        disabled={isImagePending}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <X className="h-5 w-5 text-white" />
                      </button>
                    </div>
                  ))}
                  {pendingSecondary.map((item, i) => (
                    <div
                      key={`pending-${i}`}
                      className="relative group w-24 h-16 rounded-lg overflow-hidden border bg-slate-100 shrink-0"
                    >
                      <Image
                        src={item.previewUrl}
                        alt="foto in asteptare"
                        fill
                        className="object-cover"
                        sizes="96px"
                        unoptimized
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePendingSecondary(i)}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <X className="h-5 w-5 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {uploadError && (
                <p className="text-xs text-red-600 bg-red-50 p-2 rounded">{uploadError}</p>
              )}
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
