import { useState } from 'react'
import { API_URL } from '../lib/api'

interface Props {
  listingId: number
  reviewedId: number
  accessToken: string
  onSubmitted: () => void
}

export default function LeaveReviewForm({ listingId, reviewedId, accessToken, onSubmitted }: Props) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) { setError('Please select a star rating.'); return }
    if (body.trim().length < 10) { setError('Review must be at least 10 characters.'); return }
    setSubmitting(true)
    setError('')
    const res = await fetch(`${API_URL}/api/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ listingId, reviewedId, rating, body: body.trim() }),
    })
    const data = await res.json()
    setSubmitting(false)
    if (!res.ok) { setError(data.error || 'Failed to submit review.'); return }
    onSubmitted()
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#F1F5F9] rounded-xl p-4 flex flex-col gap-3">
      <p className="font-semibold text-sm">Leave a Review</p>

      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(0)}
            className="text-3xl cursor-pointer leading-none"
            style={{ color: n <= (hovered || rating) ? '#FF9E0C' : '#D1D5DB' }}
          >
            ★
          </button>
        ))}
      </div>

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Share your experience with this seller..."
        rows={3}
        className="w-full rounded-lg border border-gray-200 bg-white p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#3A8A8F]"
      />

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="self-end px-5 py-2 rounded-lg text-white font-semibold text-sm cursor-pointer disabled:opacity-50"
        style={{ backgroundColor: '#FF9E0C' }}
      >
        {submitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  )
}
