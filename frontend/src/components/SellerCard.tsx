import { Link } from 'react-router-dom'
import Avatar from './Avatar'

interface Props {
  user: { id: number; username: string; photoUrl: string | null }
  avgRating?: number | null
  reviewCount?: number
}

export default function SellerCard({ user, avgRating, reviewCount }: Props) {
  return (
    <Link to={`/users/${user.id}`} className="bg-[#F1F5F9] rounded-xl p-4 flex items-center gap-3 hover:bg-gray-200 transition-colors">
      <Avatar username={user.username} photoUrl={user.photoUrl} size="sm" />
      <div>
        <p className="text-xs text-gray-400">Listed by</p>
        <p className="font-semibold text-sm">{user.username}</p>
        {avgRating != null && reviewCount != null && (
          <p className="text-xs text-gray-500 mt-0.5">
            <span style={{ color: '#FF9E0C' }}>★</span>{' '}
            {avgRating.toFixed(1)} · {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
          </p>
        )}
      </div>
    </Link>
  )
}
