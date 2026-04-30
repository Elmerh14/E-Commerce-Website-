interface Props {
  username: string
  photoUrl: string | null
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: { wrapper: 'w-9 h-9 text-sm', img: 'w-9 h-9' },
  md: { wrapper: 'w-12 h-12 text-base', img: 'w-12 h-12' },
  lg: { wrapper: 'w-20 h-20 text-3xl', img: 'w-20 h-20' },
}

export default function Avatar({ username, photoUrl, size = 'md' }: Props) {
  const { wrapper, img } = sizes[size]

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={username}
        className={`${img} rounded-full object-cover shrink-0`}
      />
    )
  }

  return (
    <div className={`${wrapper} rounded-full bg-[#3A8A8F] flex items-center justify-center text-white font-bold shrink-0`}>
      {username.charAt(0).toUpperCase()}
    </div>
  )
}
