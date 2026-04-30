import Avatar from './Avatar'

export interface Review {
  id: number
  listingId: number | null
  reviewerId: number
  rating: number
  body: string
  createdAt: string
  reviewer: { id: number; username: string; photoUrl: string | null }
}

function Stars({ rating }: { rating: number }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} style={{ color: n <= rating ? '#FF9E0C' : '#D1D5DB' }}>★</span>
      ))}
    </span>
  )
}

export default function ReviewCard({ review }: { review: Review }) {
  const date = new Date(review.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="bg-[#F1F5F9] rounded-xl p-4 flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <Avatar username={review.reviewer.username} photoUrl={review.reviewer.photoUrl} size="sm" />
        <div className="flex-1">
          <p className="font-semibold text-sm">{review.reviewer.username}</p>
          <p className="text-xs text-gray-400">{date}</p>
        </div>
        <Stars rating={review.rating} />
      </div>
      <p className="text-sm text-gray-700">{review.body}</p>
    </div>
  )
}
