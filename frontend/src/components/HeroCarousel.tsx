import { useEffect, useState } from 'react'
import shoesHero from '../assets/shoesHero.jpg'
import headphonesHero from '../assets/headphonesHero.jpg'
import glassesHero from '../assets/glassesHero.jpg'
import watchHero from '../assets/watchHero.jpg'

const images = [shoesHero, headphonesHero, glassesHero, watchHero]

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length)
    }, 3500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden">
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={`Product ${i + 1}`}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0 }}
        />
      ))}

      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className="w-2 h-2 rounded-full cursor-pointer transition-colors"
            style={{ backgroundColor: i === current ? 'white' : 'rgba(255,255,255,0.5)' }}
          />
        ))}
      </div>
    </div>
  )
}
