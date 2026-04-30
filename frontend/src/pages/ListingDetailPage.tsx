import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import ListingImageGallery from '../components/ListingImageGallery'
import ListingInfo from '../components/ListingInfo'
import SellerCard from '../components/SellerCard'

interface ListingDetail {
  id: number
  title: string
  price: string | null
  type: string
  condition: string
  description: string
  location: string
  category: string
  status: string
  createdAt: string
  images: { id: number; imageUrl: string; sortOrder: number }[]
  user: { id: number; username: string; photoUrl: string | null }
}

export default function ListingDetailPage() {
  const { id } = useParams()
  const [listing, setListing] = useState<ListingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    fetch(`http://localhost:3000/api/listings/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then((data) => setListing(data.listing))
      .catch(() => setError('Listing not found.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <p className="p-8 text-gray-500">Loading...</p>
  if (error || !listing) return <p className="p-8 text-red-500">{error || 'Listing not found.'}</p>

  const imageUrls = listing.images.map((img) => img.imageUrl)

  return (
    <div className="max-w-[1280px] mx-auto px-5 py-8">
      <Link to="/listings" className="text-sm text-[#3A8A8F] hover:text-gray-600 mb-6 inline-block">
        ← Back to listings
      </Link>

      <div className="flex flex-col lg:flex-row gap-10">
        <div className="lg:w-[55%]">
          <ListingImageGallery images={imageUrls} title={listing.title} />
        </div>

        <div className="flex flex-col gap-4 lg:w-[45%]">
          <ListingInfo
            title={listing.title}
            price={listing.price}
            type={listing.type}
            condition={listing.condition}
            description={listing.description}
            location={listing.location}
            category={listing.category}
            status={listing.status}
          />
          <SellerCard user={listing.user} />
          <button
            className="w-full py-3 rounded-xl text-white font-semibold cursor-pointer"
            style={{ backgroundColor: '#FF9E0C' }}
          >
            Message Seller
          </button>
        </div>
      </div>
    </div>
  )
}
