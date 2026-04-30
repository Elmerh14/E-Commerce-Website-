import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import HeroCarousel from './HeroCarousel'

export default function HeroSection() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleSell = () => {
    if (user) navigate('/my-listings')
    else navigate('/login')
  }

  return (
    <div
      className="w-full h-[536px] rounded-[40px] flex items-center justify-between px-16 py-12 gap-12"
      style={{ background: 'linear-gradient(to right, #24575B 20%, #3A8A8F 99%)' }}
    >
      {/* Left: text + buttons */}
      <div className="flex flex-col gap-6">
        <h1 className="text-white font-bold leading-tight" style={{ fontSize: '54px' }}>
          Buy. Trade. Sell.<br />Colorado.
        </h1>

        <p className="text-white" style={{ fontSize: '21px' }}>
          Colorado's Marketplace.<br />Built by the Barrio.
        </p>

        <div className="flex gap-4">
          <button
            onClick={() => navigate('/listings')}
            className="px-8 py-3 rounded-xl bg-white font-semibold cursor-pointer hover:opacity-90 transition-opacity"
            style={{ color: '#24575B', fontSize: '16px' }}
          >
            Shop
          </button>
          <button
            onClick={handleSell}
            className="px-8 py-3 rounded-xl font-semibold text-white cursor-pointer hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#FF9E0C', fontSize: '16px' }}
          >
            Sell
          </button>
        </div>
      </div>

      {/* Right: image carousel */}
      <div className="w-[580px] self-stretch shrink-0">
        <HeroCarousel />
      </div>
    </div>
  )
}
