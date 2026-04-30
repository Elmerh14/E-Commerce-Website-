import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { API_URL } from '../lib/api'
import ListingImageGallery from '../components/ListingImageGallery'
import ListingInfo from '../components/ListingInfo'
import SellerCard from '../components/SellerCard'
import EditListingForm from '../components/EditListingForm'
import ReviewCard from '../components/ReviewCard'
import LeaveReviewForm from '../components/LeaveReviewForm'
import type { Review } from '../components/ReviewCard'

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
  const { user, accessToken } = useAuth()
  const navigate = useNavigate()
  const [listing, setListing] = useState<ListingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reviews, setReviews] = useState<Review[]>([])
  const [hasConversation, setHasConversation] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError('')
    fetch(`${API_URL}/api/listings/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then((data) => setListing(data.listing))
      .catch(() => setError('Listing not found.'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!listing) return
    fetch(`${API_URL}/api/users/${listing.user.id}/reviews`)
      .then((res) => res.json())
      .then((data) => setReviews(data.reviews ?? []))
  }, [listing])

  useEffect(() => {
    if (!listing || !user || !accessToken || user.id === listing.user.id) return
    fetch(`${API_URL}/api/conversations`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const convos: { listing: { id: number } }[] = data.conversations ?? []
        setHasConversation(convos.some((c) => c.listing.id === listing.id))
      })
  }, [listing, user, accessToken])

  if (loading) return <p className="p-8 text-gray-500">Loading...</p>
  if (error || !listing) return <p className="p-8 text-red-500">{error || 'Listing not found.'}</p>

  const imageUrls = listing.images.map((img) => img.imageUrl)
  const isOwner = user?.id === listing.user.id
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : null
  const alreadyReviewed = user ? reviews.some((r) => r.reviewerId === user.id && r.listingId === listing.id) : false

  const refetchReviews = () => {
    fetch(`${API_URL}/api/users/${listing.user.id}/reviews`)
      .then((res) => res.json())
      .then((data) => setReviews(data.reviews ?? []))
  }

  const handleMessageSeller = async () => {
    if (!user) { navigate('/login'); return }
    const res = await fetch(`${API_URL}/api/conversations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ listingId: listing.id }),
    })
    if (!res.ok) return
    const data = await res.json()
    navigate(`/messages/${data.conversation.id}`)
  }

  return (
    <div className="max-w-[1280px] mx-auto px-5 py-8">
      <Link to={isOwner ? '/my-listings' : '/listings'} className="text-sm text-[#3A8A8F] hover:text-gray-600 mb-6 inline-block">
        ← Back to {isOwner ? 'my listings' : 'listings'}
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
          <SellerCard user={listing.user} avgRating={avgRating} reviewCount={reviews.length} />
          {!isOwner && (
            <button
              onClick={handleMessageSeller}
              className="w-full py-3 rounded-xl text-white font-semibold cursor-pointer"
              style={{ backgroundColor: '#FF9E0C' }}
            >
              Message Seller
            </button>
          )}
        </div>
      </div>

      {isOwner && <EditListingForm listing={listing} />}

      <section className="mt-12">
        <h2 className="text-xl font-bold mb-5">Seller Reviews</h2>

        {reviews.length === 0 && (
          <p className="text-sm text-gray-500 mb-4">No reviews yet.</p>
        )}

        <div className="flex flex-col gap-3">
          {reviews.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </div>

        {!isOwner && user && hasConversation && !alreadyReviewed && (
          <div className="mt-6">
            <LeaveReviewForm
              listingId={listing.id}
              reviewedId={listing.user.id}
              accessToken={accessToken!}
              onSubmitted={refetchReviews}
            />
          </div>
        )}

        {!isOwner && user && hasConversation && alreadyReviewed && (
          <p className="mt-4 text-sm text-[#3A8A8F]">You've already left a review for this listing.</p>
        )}
      </section>
    </div>
  )
}
