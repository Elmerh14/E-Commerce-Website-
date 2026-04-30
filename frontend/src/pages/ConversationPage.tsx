import { useEffect, useRef, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { API_URL } from '../lib/api'
import MessageBubble from '../components/MessageBubble'
import MessageInput from '../components/MessageInput'

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
}

interface Message {
  id: number
  senderId: number
  body: string
  createdAt: string
  isRead: boolean
}

export default function ConversationPage() {
  const { id } = useParams()
  const { user, accessToken, loading } = useAuth()
  const navigate = useNavigate()
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!loading && !user) navigate('/login')
  }, [user, loading, navigate])

  useEffect(() => {
    if (!accessToken) return

    const fetchAll = () => {
      fetch(`${API_URL}/api/conversations/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error()
          return res.json()
        })
        .then((data) => setConversation(data.conversation))
        .catch(() => setError('Conversation not found.'))

      fetch(`${API_URL}/api/conversations/${id}/messages`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error()
          return res.json()
        })
        .then((data) => setMessages(data.messages ?? []))
        .catch(() => {})
    }

    fetchAll()

    fetch(`${API_URL}/api/conversations/${id}/messages/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    const interval = setInterval(() => {
      fetch(`${API_URL}/api/conversations/${id}/messages`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error()
          return res.json()
        })
        .then((data) => setMessages(data.messages ?? []))
        .catch(() => {})
    }, 30000)

    return () => clearInterval(interval)
  }, [id, accessToken])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (body: string) => {
    const res = await fetch(`${API_URL}/api/conversations/${id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ body }),
    })
    if (!res.ok) return
    const data = await res.json()
    setMessages((prev) => [...prev, data.message])
  }

  if (loading || !user) return null
  if (error) return <p className="p-8 text-red-500">{error}</p>
  if (!conversation) return <p className="p-8 text-gray-500">Loading...</p>

  const otherPerson = conversation.buyerId === user.id ? conversation.seller : conversation.buyer

  return (
    <div className="max-w-[1280px] mx-auto px-5 py-8">
      <Link to="/messages" className="text-sm text-[#3A8A8F] hover:text-gray-600 mb-6 inline-block">
        ← Back to messages
      </Link>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col" style={{ height: 'calc(100vh - 220px)' }}>

        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-100">
          {otherPerson.photoUrl ? (
            <img src={otherPerson.photoUrl} alt={otherPerson.username} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#3A8A8F] flex items-center justify-center text-white font-bold text-sm">
              {otherPerson.username.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-semibold text-sm">{otherPerson.username}</p>
            <Link to={`/listings/${conversation.listing.id}`} className="text-xs text-[#3A8A8F] hover:underline">
              {conversation.listing.title}
            </Link>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {messages.length === 0 && (
            <p className="text-sm text-gray-400 text-center mt-4">No messages yet. Say hello!</p>
          )}
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              body={msg.body}
              createdAt={msg.createdAt}
              isSent={msg.senderId === user.id}
            />
          ))}
          <div ref={bottomRef} />
        </div>

        <MessageInput onSend={handleSend} />
      </div>
    </div>
  )
}
