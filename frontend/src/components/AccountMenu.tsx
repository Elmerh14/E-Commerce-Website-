import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import accountIcon from '../assets/account.svg'

export default function AccountMenu() {
  const { user, loading, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (loading) return <div className="w-7 h-7" />

  if (!user) {
    return (
      <Link to="/login" className="flex items-center gap-1 cursor-pointer">
        <img src={accountIcon} alt="account" className="w-7 h-7" />
      </Link>
    )
  }

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 cursor-pointer">
        {user.photoUrl ? (
          <img src={user.photoUrl} alt={user.username} className="w-8 h-8 rounded-full object-cover" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#3A8A8F] flex items-center justify-center text-white font-bold text-sm">
            {user.username.charAt(0).toUpperCase()}
          </div>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
          <Link
            to="/my-listings"
            onClick={() => setOpen(false)}
            className="block px-4 py-3 text-sm hover:bg-gray-50 font-medium border-b border-gray-100"
          >
            My Listings
          </Link>
          <button
            onClick={() => { logout(); navigate('/'); setOpen(false) }}
            className="w-full px-4 py-3 text-sm text-left hover:bg-gray-50 text-red-500 font-medium cursor-pointer"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  )
}
