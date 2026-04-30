import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ListingCard, { type Listing } from '../components/ListingCard'

export default function ListingsPage() {
  const [searchParams] = useSearchParams()
  const search = searchParams.get('search') ?? ''
  const category = searchParams.get('category') ?? ''

  const [listings, setListings] = useState<Listing[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')

    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (category && category !== 'All Categories') params.set('category', category)

    fetch(`http://localhost:3000/api/listings?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setListings(data.listings)
        setTotal(data.pagination.total)
      })
      .catch(() => setError('Failed to load listings.'))
      .finally(() => setLoading(false))
  }, [search, category])

  const heading = search
    ? `Results for "${search}"`
    : category && category !== 'All Categories'
    ? category
    : 'All Listings'

  return (
    <div className="max-w-[1280px] mx-auto px-5 py-8">
      <h1 className="text-2xl font-bold mb-1">{heading}</h1>
      {!loading && <p className="text-sm text-gray-500 mb-6">{total} listing{total !== 1 ? 's' : ''} found</p>}

      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && listings.length === 0 && (
        <p className="text-gray-500">No listings found.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  )
}
