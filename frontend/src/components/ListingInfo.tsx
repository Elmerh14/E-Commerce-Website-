interface Props {
  title: string
  price: string | null
  type: string
  condition: string
  description: string
  location: string
  category: string
  status: string
}

const typeLabel: Record<string, string> = {
  SELL: 'Selling',
  BARTER: 'Barter',
  BOTH: 'Selling & Barter',
}

const conditionLabel: Record<string, string> = {
  NEW: 'New',
  LIKE_NEW: 'Like New',
  GOOD: 'Good',
  FAIR: 'Fair',
  POOR: 'Poor',
}

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  SOLD: 'bg-red-100 text-red-700',
  TRADED: 'bg-blue-100 text-blue-700',
  REMOVED: 'bg-gray-100 text-gray-500',
}

export default function ListingInfo({ title, price, type, condition, description, location, category, status }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <h1 className="text-2xl font-bold leading-tight">{title}</h1>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full shrink-0 ${statusColors[status] ?? 'bg-gray-100 text-gray-500'}`}>
          {status.charAt(0) + status.slice(1).toLowerCase()}
        </span>
      </div>

      <p className="text-3xl font-bold">
        {price ? `$${price}` : 'Barter'}
      </p>

      <div className="bg-[#F1F5F9] rounded-xl p-4 flex flex-col gap-2 text-sm text-gray-600">
        <div className="flex justify-between">
          <span className="text-gray-400">Category</span>
          <span className="font-medium">{category}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Condition</span>
          <span className="font-medium">{conditionLabel[condition] ?? condition}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Type</span>
          <span className="font-medium">{typeLabel[type] ?? type}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Location</span>
          <span className="font-medium">{location}</span>
        </div>
      </div>

      <div>
        <h2 className="font-semibold mb-1">Description</h2>
        <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
      </div>
    </div>
  )
}
