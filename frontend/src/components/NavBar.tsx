import Logo from './Logo.tsx'
import cart from '../assets/cart.svg'
import accountIcon from '../assets/account.svg'
import hamburgerMenue from '../assets/hamburgerMenue.svg'

export default function NavBar() {
  return (
    <nav className="flex items-center justify-between px-4 py-3 bg-white shadow-sm">
      <div className="flex-1">
        <img src={hamburgerMenue} alt="open navigation menu" className="w-7 h-7 cursor-pointer" />
      </div>

      <Logo className="h-25 w-auto" />

      <div className="flex-1 flex items-center justify-end gap-4">
        <img src={accountIcon} alt="account" className="w-7 h-7 cursor-pointer" />
        <img src={cart} alt="shopping cart" className="w-7 h-7 cursor-pointer" />
      </div>
    </nav>
  )
}
