import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ListingCard, { type Listing } from '../components/ListingCard'
import { API_URL } from '../lib/api'

const TYPE_FILTERS = [
  { value: '', label: 'All' },
  { value: 'SELL', label: 'For Sale' },
  { value: 'BARTER', label: 'Barter' },
]

export default function ListingsPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const search = searchParams.get('search') ?? ''
  const rawCategory = searchParams.get('category') ?? ''
  const category = rawCategory === 'All Categories' ? '' : rawCategory
  const type = searchParams.get('type') ?? ''
  const minPrice = searchParams.get('minPrice') ?? ''
  const maxPrice = searchParams.get('maxPrice') ?? ''
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))

  const [listings, setListings] = useState<Listing[]>([])
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Local state for price inputs — applied on blur
  const [minInput, setMinInput] = useState(minPrice)
  const [maxInput, setMaxInput] = useState(maxPrice)

  // Sync price inputs if URL changes externally (e.g. category nav click)
  useEffect(() => {
    setMinInput(minPrice)
    setMaxInput(maxPrice)
  }, [minPrice, maxPrice])

  useEffect(() => {
    setLoading(true)
    setError('')

    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (category) params.set('category', category)
    if (type) params.set('type', type)
    if (minPrice) params.set('minPrice', minPrice)
    if (maxPrice) params.set('maxPrice', maxPrice)
    params.set('page', String(page))

    fetch(`${API_URL}/api/listings?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setListings(data.listings)
        setPagination(data.pagination)
      })
      .catch(() => setError('Failed to load listings.'))
      .finally(() => setLoading(false))
  }, [search, category, type, minPrice, maxPrice, page])

  const setParam = (key: string, value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value) next.set(key, value)
      else next.delete(key)
      next.delete('page')
      return next
    }, { replace: true })
  }

  const applyPrice = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (minInput) next.set('minPrice', minInput)
      else next.delete('minPrice')
      if (maxInput) next.set('maxPrice', maxInput)
      else next.delete('maxPrice')
      next.delete('page')
      return next
    }, { replace: true })
  }

  const goToPage = (p: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('page', String(p))
      return next
    }, { replace: true })
  }

  const heading = search
    ? `Results for "${search}"`
    : category
    ? category
    : 'All Listings'

  return (
    <div className="max-w-[1280px] mx-auto px-5 py-8">
      <h1 className="text-2xl font-bold mb-4">{heading}</h1>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Type toggle */}
        <div className="flex rounded-lg overflow-hidden border border-gray-200 shrink-0">
          {TYPE_FILTERS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setParam('type', value)}
              className={`px-4 py-1.5 text-sm font-medium cursor-pointer transition-colors ${
                type === value
                  ? 'bg-[#3A8A8F] text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Price range */}
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            placeholder="Min $"
            value={minInput}
            onChange={(e) => setMinInput(e.target.value)}
            onBlur={applyPrice}
            className="w-24 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A8A8F]"
          />
          <span className="text-gray-400 text-sm">–</span>
          <input
            type="number"
            min="0"
            placeholder="Max $"
            value={maxInput}
            onChange={(e) => setMaxInput(e.target.value)}
            onBlur={applyPrice}
            className="w-24 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A8A8F]"
          />
        </div>

        {!loading && (
          <p className="text-sm text-gray-500 ml-auto">
            {pagination.total} listing{pagination.total !== 1 ? 's' : ''}
          </p>
        )}
      </div>

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

      {/* Pagination */}
      {!loading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-10">
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium cursor-pointer hover:bg-gray-50 disabled:opacity-40 disabled:cursor-default"
          >
            ← Prev
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => goToPage(page + 1)}
            disabled={page >= pagination.totalPages}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium cursor-pointer hover:bg-gray-50 disabled:opacity-40 disabled:cursor-default"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
