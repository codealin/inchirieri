'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface CarImageGalleryProps {
  images: string[]
  carName: string
}

export function CarImageGallery({ images, carName }: CarImageGalleryProps) {
  const [selected, setSelected] = useState(0)

  if (images.length === 0) {
    return (
      <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-100 mb-6 flex items-center justify-center text-slate-400">
        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3" />
          <rect x="9" y="11" width="14" height="10" rx="2" />
          <circle cx="12" cy="19" r="1" />
          <circle cx="20" cy="19" r="1" />
        </svg>
      </div>
    )
  }

  return (
    <div className="mb-6">
      <div className="relative aspect-[16/10] rounded-xl overflow-hidden">
        <Image
          src={images[selected]}
          alt={`${carName} - foto ${selected + 1}`}
          fill
          className="object-contain p-3"
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={cn(
                'relative w-20 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all',
                selected === i
                  ? 'border-primary opacity-100'
                  : 'border-transparent opacity-60 hover:opacity-90'
              )}
            >
              <Image
                src={img}
                alt={`${carName} foto ${i + 1}`}
                fill
                className="object-contain"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
