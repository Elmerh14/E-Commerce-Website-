interface Props {
  user: { id: number; username: string; photoUrl: string | null }
}

export default function SellerCard({ user }: Props) {
  return (
    <div className="bg-[#F1F5F9] rounded-xl p-4 flex items-center gap-3">
      {user.photoUrl ? (
        <img src={user.photoUrl} alt={user.username} className="w-10 h-10 rounded-full object-cover" />
      ) : (
        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-500 font-bold text-sm">
          {user.username.charAt(0).toUpperCase()}
        </div>
      )}
      <div>
        <p className="text-xs text-gray-400">Listed by</p>
        <p className="font-semibold text-sm">{user.username}</p>
      </div>
    </div>
  )
}
