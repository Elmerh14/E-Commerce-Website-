import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { API_URL } from '../lib/api'
import Avatar from '../components/Avatar'
import ListingCard, { type Listing } from '../components/ListingCard'
import ReviewCard from '../components/ReviewCard'
import type { Review } from '../components/ReviewCard'

interface UserProfile {
  id: number
  username: string
  photoUrl: string | null
}

export default function UserProfilePage() {
  const { id } = useParams()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [listings, setListings] = useState<Listing[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')

    Promise.all([
      fetch(`${API_URL}/api/users/${id}`).then((r) => r.json()),
      fetch(`${API_URL}/api/listings?userId=${id}`).then((r) => r.json()),
      fetch(`${API_URL}/api/users/${id}/reviews`).then((r) => r.json()),
    ])
      .then(([userData, listingsData, reviewsData]) => {
        if (!userData.user) { setError('User not found.'); return }
        setProfile(userData.user)
        setListings(listingsData.listings ?? [])
        setReviews(reviewsData.reviews ?? [])
      })
      .catch(() => setError('Failed to load profile.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <p className="p-8 text-gray-500">Loading...</p>
  if (error || !profile) return <p className="p-8 text-red-500">{error || 'User not found.'}</p>

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : null

  return (
    <div className="max-w-[1280px] mx-auto px-5 py-8">
      <Link to="/listings" className="text-sm text-[#3A8A8F] hover:text-gray-600 mb-6 inline-block">
        ← Back to listings
      </Link>

      {/* Profile header */}
      <div className="flex items-center gap-5 mb-10">
        <Avatar username={profile.username} photoUrl={profile.photoUrl} size="lg" />
        <div>
          <h1 className="text-2xl font-bold">{profile.username}</h1>
          {avgRating != null ? (
            <p className="text-sm text-gray-500 mt-1">
              <span style={{ color: '#FF9E0C' }}>★</span>{' '}
              {avgRating.toFixed(1)} · {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
            </p>
          ) : (
            <p className="text-sm text-gray-400 mt-1">No reviews yet</p>
          )}
        </div>
      </div>

      {/* Active listings */}
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-5">
          Listings
          {listings.length > 0 && (
            <span className="ml-2 text-base font-normal text-gray-400">({listings.length})</span>
          )}
        </h2>
        {listings.length === 0 ? (
          <p className="text-sm text-gray-500">No active listings.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>

      {/* Reviews */}
      <section>
        <h2 className="text-xl font-bold mb-5">
          Reviews
          {reviews.length > 0 && (
            <span className="ml-2 text-base font-normal text-gray-400">({reviews.length})</span>
          )}
        </h2>
        {reviews.length === 0 ? (
          <p className="text-sm text-gray-500">No reviews yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {reviews.map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
