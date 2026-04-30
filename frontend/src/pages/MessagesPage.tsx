import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { API_URL } from '../lib/api'
import Container from '../components/Container'
import ConversationCard from '../components/ConversationCard'

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

export default function MessagesPage() {
  const { user, accessToken, loading } = useAuth()
  const navigate = useNavigate()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loading && !user) navigate('/login')
  }, [user, loading, navigate])

  useEffect(() => {
    if (!accessToken) return

    const fetchConversations = () =>
      fetch(`${API_URL}/api/conversations`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
        .then((res) => res.json())
        .then((data) => setConversations(data.conversations))
        .catch(() => setError('Failed to load conversations.'))
        .finally(() => setFetching(false))

    fetchConversations()
    const interval = setInterval(fetchConversations, 10000)
    return () => clearInterval(interval)
  }, [accessToken])

  if (loading || !user) return null

  return (
    <div className="max-w-[1280px] mx-auto px-5 py-8">
      <Container>
        <h1 className="text-2xl font-bold mb-6">Messages</h1>

        {fetching && <p className="text-gray-500">Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!fetching && !error && conversations.length === 0 && (
          <p className="text-gray-500">No conversations yet.</p>
        )}

        <div className="flex flex-col gap-3">
          {conversations.map((c) => (
            <ConversationCard key={c.id} conversation={c} currentUserId={user.id} />
          ))}
        </div>
      </Container>
    </div>
  )
}
