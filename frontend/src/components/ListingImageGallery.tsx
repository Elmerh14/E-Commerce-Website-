import { useState } from 'react'
import listingPlaceHolder from '../assets/listingPlaceHolder.svg'

interface Props {
  images: string[]
  title: string
}

export default function ListingImageGallery({ images, title }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)
  const display = images.length > 0 ? images : [listingPlaceHolder]

  const prev = () => setActiveIndex((i) => (i === 0 ? display.length - 1 : i - 1))
  const next = () => setActiveIndex((i) => (i === display.length - 1 ? 0 : i + 1))

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <img
          src={display[activeIndex]}
          alt={title}
          className="w-full h-[400px] object-cover rounded-xl"
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
  )
}
