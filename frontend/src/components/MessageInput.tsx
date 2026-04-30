import { useState } from 'react'

interface Props {
  onSend: (body: string) => Promise<void>
  disabled?: boolean
}

export default function MessageInput({ onSend, disabled }: Props) {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)

  const handleSend = async () => {
    const trimmed = text.trim()
    if (!trimmed || sending) return
    setSending(true)
    try {
      await onSend(trimmed)
      setText('')
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSend()
  }

  return (
    <div className="flex items-center gap-3 p-4 border-t border-gray-100">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message…"
        disabled={disabled || sending}
        className="flex-1 border border-gray-200 rounded-full px-4 py-2.5 text-sm outline-none focus:border-[#3A8A8F] transition-colors disabled:opacity-50"
      />
      <button
        onClick={handleSend}
        disabled={!text.trim() || sending || disabled}
        className="px-5 py-2.5 rounded-full text-white font-semibold text-sm cursor-pointer disabled:opacity-50"
        style={{ backgroundColor: '#FF9E0C' }}
      >
        Send
      </button>
    </div>
  )
}
