import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from './Logo.tsx'
import Container from './Container.tsx'
import cart from '../assets/cart.svg'
import accountIcon from '../assets/account.svg'
import hamburgerMenue from '../assets/hamburgerMenue.svg'
import searchIcon from '../assets/searchButoon.svg'

const categories = ['All Categories', 'Auto', 'Clothing', 'Electronics', 'Home', 'Kids', 'Tools']
const mobileCategories = categories.filter((cat) => cat !== 'All Categories')

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  function handleSearch() {
    const trimmed = query.trim()
    if (!trimmed) return
    navigate(`/listings?search=${encodeURIComponent(trimmed)}`)
    setQuery('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <nav>

      {/* ── Main row ── */}
      <Container className="flex items-center justify-between py-3 md:py-2">

        {/* Left: hamburger on mobile / logo on desktop */}
        <div className="flex-1 flex items-center">
          <img src={hamburgerMenue} alt="open navigation menu" className="w-9 h-9 cursor-pointer md:hidden" onClick={() => setMenuOpen(true)} />
          <Link to="/" className="hidden md:flex items-center gap-2">
            <Logo className="h-25 w-auto" />
            <span className="font-bold text-base">Barrio Base</span>
          </Link>
        </div>

        {/* Center: logo on mobile / search bar on desktop */}
        <div className="flex items-center md:flex-3 md:mx-6">
          <Link to="/" className="md:hidden">
            <Logo className="h-25 w-auto" />
          </Link>
          <div className="hidden md:flex items-center w-full bg-black/10 rounded-full px-4 py-3 gap-2">
            <input
              type="text"
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 outline-none text-sm font-bold bg-transparent text-gray-700 placeholder-gray-500"
            />
            <img src={searchIcon} alt="search" className="w-4 h-4 shrink-0 cursor-pointer" onClick={handleSearch} />
          </div>
        </div>

        {/* Right: icons always visible */}
        <div className="flex-1 flex items-center justify-end gap-4 md:gap-20">
          <Link to="/login" className="hidden md:flex items-center gap-1 cursor-pointer">
            <img src={accountIcon} alt="account" className="w-7 h-7" />
            <span className="font-bold text-base">Account</span>
          </Link>
          <img src={accountIcon} alt="account" className="w-7 h-7 cursor-pointer md:hidden" />
          <img src={cart} alt="shopping cart" className="w-7 h-7 cursor-pointer" />
        </div>

      </Container>

      {/* ── Mobile search bar ── */}
      <div className="md:hidden px-4 pb-3">
        <div className="flex items-center w-full bg-black/10 rounded-full px-4 py-3 gap-2">
          <input
            type="text"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 outline-none text-sm bg-transparent text-gray-700 placeholder-gray-500"
          />
          <img src={searchIcon} alt="search" className="w-4 h-4 shrink-0 cursor-pointer" onClick={handleSearch} />
        </div>
      </div>

      {/* ── Category links row — desktop only ── */}
      <div className="hidden md:block bg-[#F1F5F9]">
        <Container className="flex items-center justify-between py-6 text-base">
          {categories.map((cat) => (
            <Link key={cat} to={`/listings?category=${cat}`} className="hover:text-gray-900 whitespace-nowrap">
              {cat}
            </Link>
          ))}
        </Container>
      </div>

      {/* ── Mobile side drawer ── */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={() => setMenuOpen(false)} />

          {/* Drawer */}
          <div className="absolute top-0 left-0 h-full w-72 bg-white flex flex-col">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <Logo className="h-25 w-auto" />
              <button onClick={() => setMenuOpen(false)} className="text-black text-5xl leading-none">&times;</button>
            </div>

            {/* Category links */}
            <nav className="flex flex-col px-5 py-4 gap-1">
              {mobileCategories.map((cat) => (
                <Link
                  key={cat}
                  to={`/listings?category=${cat}`}
                  className="py-3 text-base border-b border-gray-100 last:border-0"
                  onClick={() => setMenuOpen(false)}
                >
                  {cat}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

    </nav>
  )
}
