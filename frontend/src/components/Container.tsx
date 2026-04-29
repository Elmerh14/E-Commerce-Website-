import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
}

export default function Container({ children, className = '' }: Props) {
  return (
    <div className={`w-full max-w-[1280px] mx-auto px-5 ${className}`}>
      {children}
    </div>
  )
}
