import { Link } from 'react-router-dom'
import listingPlaceHolder from '../assets/listingPlaceHolder.svg'

export interface Listing {
  id: number
  title: string
  price: string | null
  type: string
  condition: string
  location: string
  category: string
  status?: string
  images: { imageUrl: string }[]
  user: { id: number; username: string; photoUrl: string | null }
}

interface Props {
  listing: Listing
  showStatus?: boolean
  buttonLabel?: string
}

const typeLabel: Record<string, string> = {
  SELL: 'Selling',
  BARTER: 'Barter',
  BOTH: 'Selling & Barter',
}

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  SOLD: 'bg-red-100 text-red-700',
  TRADED: 'bg-blue-100 text-blue-700',
  REMOVED: 'bg-gray-100 text-gray-500',
}

export default function ListingCard({ listing, showStatus = false, buttonLabel = 'More Info' }: Props) {
  const image = listing.images[0]?.imageUrl ?? listingPlaceHolder

  return (
    <div className="bg-[#F1F5F9] rounded-lg overflow-hidden flex flex-col">
      <div className="relative">
        <img src={image} alt={listing.title} className="w-full h-48 object-cover" />
        {showStatus && listing.status && (
          <span className={`absolute top-2 right-2 text-xs font-semibold px-2 py-1 rounded-full ${statusColors[listing.status] ?? 'bg-gray-100 text-gray-500'}`}>
            {listing.status.charAt(0) + listing.status.slice(1).toLowerCase()}
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <span className="text-xs text-gray-400 uppercase tracking-wide">{listing.category}</span>
        <h2 className="font-semibold text-base leading-tight">{listing.title}</h2>
        <p className="font-bold text-lg">
          {listing.price ? `$${listing.price}` : 'Barter'}
        </p>
        <div className="text-sm text-gray-500 flex flex-col gap-1">
          <p>{listing.condition}</p>
          <p>{listing.location}</p>
          <p>{typeLabel[listing.type] ?? listing.type}</p>
        </div>
        <Link to={`/listings/${listing.id}`} className="mt-auto pt-3">
          <button
            className="w-full py-2 rounded-lg text-white font-semibold text-sm cursor-pointer"
            style={{ backgroundColor: '#FF9E0C' }}
          >
            {buttonLabel}
          </button>
        </Link>
      </div>
    </div>
  )
}
