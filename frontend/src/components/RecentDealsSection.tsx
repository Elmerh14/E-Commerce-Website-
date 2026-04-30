import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { API_URL } from '../lib/api'
import Container from './Container'
import ListingCard, { type Listing } from './ListingCard'

export default function RecentDealsSection() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_URL}/api/listings/recent`)
      .then((res) => res.json())
      .then((data) => setListings(data.forSale ?? []))
      .finally(() => setLoading(false))
  }, [])

  if (loading || listings.length === 0) return null

  return (
    <section className="py-10">
      <Container>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-[30px] md:text-[50px]">Recent Deals</h2>
          <Link
            to="/listings?type=SELL"
            className="text-sm font-medium hover:opacity-70 transition-opacity"
            style={{ color: '#3A8A8F' }}
          >
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
          {listings.slice(0, 4).map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </Container>
    </section>
  )
}
