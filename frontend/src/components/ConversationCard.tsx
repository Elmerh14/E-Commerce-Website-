import { Link } from 'react-router-dom'
import Avatar from './Avatar'

interface Participant {
  id: number
  username: string
  photoUrl: string | null
}

interface Conversation {
  id: number
  buyerId: number
  sellerId: number
  listing: { id: number; title: string; status: string }
  buyer: Participant
  seller: Participant
  messages: { body: string; createdAt: string }[]
  _count?: { messages: number }
}

interface Props {
  conversation: Conversation
  currentUserId: number
}

export default function ConversationCard({ conversation, currentUserId }: Props) {
  const otherPerson = conversation.buyerId === currentUserId ? conversation.seller : conversation.buyer
  const lastMessage = conversation.messages[0]
  const unreadCount = conversation._count?.messages ?? 0

  return (
    <Link to={`/messages/${conversation.id}`} className="flex items-center gap-4 p-4 bg-[#F1F5F9] rounded-xl hover:bg-gray-200 transition-colors">
      <Avatar username={otherPerson.username} photoUrl={otherPerson.photoUrl} size="md" />
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <p className={`text-sm ${unreadCount > 0 ? 'font-bold text-gray-900' : 'font-semibold'}`}>
          {otherPerson.username}
        </p>
        <p className="text-xs text-gray-400 truncate">{conversation.listing.title}</p>
        {lastMessage && (
          <p className={`text-sm truncate ${unreadCount > 0 ? 'font-semibold text-gray-800' : 'text-gray-500'}`}>
            {lastMessage.body}
          </p>
        )}
      </div>
      {unreadCount > 0 && (
        <span className="shrink-0 min-w-[22px] h-[22px] px-1.5 rounded-full bg-[#3A8A8F] text-white text-xs font-bold flex items-center justify-center">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  )
}
