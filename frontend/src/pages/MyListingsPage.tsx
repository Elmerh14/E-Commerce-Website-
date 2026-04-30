import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { API_URL } from '../lib/api'
import Container from '../components/Container'
import ListingCard from '../components/ListingCard'
import type { Listing } from '../components/ListingCard'

export default function MyListingsPage() {
  const { user, accessToken, loading } = useAuth()
  const navigate = useNavigate()
  const [listings, setListings] = useState<Listing[]>([])
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loading && !user) navigate('/login')
  }, [user, loading, navigate])

  useEffect(() => {
    if (!accessToken) return
    fetch(`${API_URL}/api/users/listings`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((res) => res.json())
      .then((data) => setListings(data.listings))
      .catch(() => setError('Failed to load your listings.'))
      .finally(() => setFetching(false))
  }, [accessToken])

  if (loading || !user) return null

  return (
    <div className="max-w-[1280px] mx-auto px-5 py-8">
      <Container>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">My Listings</h1>
          <button
            onClick={() => navigate('/listings/create')}
            className="px-4 py-2 rounded-lg text-white font-semibold text-sm cursor-pointer"
            style={{ backgroundColor: '#FF9E0C' }}
          >
            + Listing
          </button>
        </div>

        {fetching && <p className="text-gray-500">Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!fetching && !error && listings.length === 0 && (
          <p className="text-gray-500">You haven't posted any listings yet.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} showStatus buttonLabel="Edit" />
          ))}
        </div>
      </Container>
    </div>
  )
}
