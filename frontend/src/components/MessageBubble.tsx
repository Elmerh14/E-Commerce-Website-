interface Props {
  body: string
  createdAt: string
  isSent: boolean
}

export default function MessageBubble({ body, createdAt, isSent }: Props) {
  const time = new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <div className={`flex flex-col gap-1 max-w-[70%] ${isSent ? 'self-end items-end' : 'self-start items-start'}`}>
      <div
        className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isSent ? 'text-white rounded-br-sm' : 'bg-[#F1F5F9] text-gray-800 rounded-bl-sm'
        }`}
        style={isSent ? { backgroundColor: '#FF9E0C' } : {}}
      >
        {body}
      </div>
      <span className="text-xs text-gray-400">{time}</span>
    </div>
  )
}
