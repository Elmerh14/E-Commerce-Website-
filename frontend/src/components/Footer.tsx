import { href, Link } from 'react-router-dom'
import Logo from './Logo'
import instagramIcon from '../assets/instagramFooter.svg'
import xIcon from '../assets/xFooter.svg'
import youtubeIcon from '../assets/youtubeFooter.svg'
import facebookIcon from '../assets/facebookFooter.svg'

const socialLinks = [
  { icon: instagramIcon, alt: 'Instagram', href: '#' },
  { icon: xIcon, alt: 'X', href: '#' },
  { icon: youtubeIcon, alt: 'YouTube', href: '#' },
  { icon: facebookIcon, alt: 'Facebook', href: '#' }
]

const usefulLinks = ['Contact', 'Help', 'FAQ']

export default function Footer() {
  return (
    <footer className="bg-[#F1F5F9] mt-16">
      <div className="max-w-[1280px] mx-auto px-5 py-12">

        {/* Main row */}
        <div className="flex flex-wrap gap-16 justify-between">

          {/* Logo */}
          <div className="flex items-start">
            <Logo className="h-25 w-auto" />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-2">
            <p className="font-semibold text-base">Email</p>
            <a
              href="mailto:support@barriobase.com"
              className="text-gray-500 text-sm hover:text-gray-800 transition-colors"
            >
              support@barriobase.com
            </a>
          </div>

          {/* Useful Links */}
          <div className="flex flex-col gap-2">
            <p className="font-semibold text-base">Useful Links</p>
            <div className="flex flex-col gap-1">
              {usefulLinks.map((label) => (
                <Link
                  key={label}
                  to="#"
                  className="text-gray-500 text-sm hover:text-gray-800 transition-colors"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Social Media */}
          <div className="flex flex-col gap-3">
            <p className="font-semibold text-base">Follow Us</p>
            <div className="flex gap-4">
              {socialLinks.map(({ icon, alt, href }) => (
                <a key={alt} href={href} aria-label={alt} className="hover:opacity-70 transition-opacity">
                  <img src={icon} alt={alt} className="w-6 h-6" />
                </a>
              ))}
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="mt-10 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-400">© Copyright Barrio Base 2026</p>
        </div>

      </div>
    </footer>
  )
}
