import { useState } from 'react'
import listingPlaceHolder from '../assets/listingPlaceHolder.svg'

interface Props {
  images: string[]
  title: string
}

export default function ListingImageGallery({ images, title }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const display = images.length > 0 ? images : [listingPlaceHolder]

  const prev = () => setActiveIndex((i) => (i === 0 ? display.length - 1 : i - 1))
  const next = () => setActiveIndex((i) => (i === display.length - 1 ? 0 : i + 1))

  return (
    <>
      <div className="flex flex-col gap-3">
        <div className="relative">
          <img
            src={display[activeIndex]}
            alt={title}
            onClick={() => setLightboxOpen(true)}
            className="w-full h-[220px] md:h-[400px] object-cover rounded-xl cursor-pointer"
          />
          {display.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-9 h-9 flex items-center justify-center transition-colors cursor-pointer"
              >
                ‹
              </button>
              <button
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-9 h-9 flex items-center justify-center transition-colors cursor-pointer"
              >
                ›
              </button>
            </>
          )}
        </div>

        {display.length > 1 && (
          <div className="flex gap-2 flex-wrap">
            {display.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`thumbnail ${i + 1}`}
                onClick={() => setActiveIndex(i)}
                className={`w-20 h-20 object-cover rounded-lg cursor-pointer border-2 transition-colors ${
                  i === activeIndex ? 'border-[#FF9E0C]' : 'border-transparent'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close button */}
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-5 right-5 text-white text-4xl leading-none cursor-pointer hover:opacity-70 transition-opacity"
          >
            &times;
          </button>

          {/* Image */}
          <img
            src={display[activeIndex]}
            alt={title}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
          />

          {/* Navigation */}
          {display.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev() }}
                className="absolute left-5 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full w-11 h-11 flex items-center justify-center text-2xl transition-colors cursor-pointer"
              >
                ‹
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next() }}
                className="absolute right-5 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full w-11 h-11 flex items-center justify-center text-2xl transition-colors cursor-pointer"
              >
                ›
              </button>
            </>
          )}

          {/* Dot indicators */}
          {display.length > 1 && (
            <div className="absolute bottom-6 flex gap-2">
              {display.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setActiveIndex(i) }}
                  className="w-2 h-2 rounded-full cursor-pointer transition-colors"
                  style={{ backgroundColor: i === activeIndex ? 'white' : 'rgba(255,255,255,0.4)' }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}
