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
  images: { imageUrl: string }[]
  user: { id: number; username: string; photoUrl: string | null }
}

interface Props {
  listing: Listing
}

const typeLabel: Record<string, string> = {
  SELL: 'Selling',
  BARTER: 'Barter',
  BOTH: 'Selling & Barter',
}

export default function ListingCard({ listing }: Props) {
  const image = listing.images[0]?.imageUrl ?? listingPlaceHolder

  return (
    <div className="bg-[#F1F5F9] rounded-lg overflow-hidden flex flex-col">
      <img
        src={image}
        alt={listing.title}
        className="w-full h-48 object-cover"
      />
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
            More Info
          </button>
        </Link>
      </div>
    </div>
  )
}
