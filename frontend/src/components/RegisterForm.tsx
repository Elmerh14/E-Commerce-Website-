import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { API_URL } from '../lib/api'
import FormField from './FormField'

export default function RegisterForm() {
  const { register, updateUserPhoto } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const token = await register(email, password, username)

      if (photoFile) {
        const presignRes = await fetch(`${API_URL}/api/users/photo/presign`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ contentType: photoFile.type }),
        })
        if (presignRes.ok) {
          const { uploadUrl, photoUrl } = await presignRes.json()
          await fetch(uploadUrl, { method: 'PUT', body: photoFile, headers: { 'Content-Type': photoFile.type } })
          await fetch(`${API_URL}/api/users/photo`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ photoUrl }),
          })
          updateUserPhoto(photoUrl)
        }
      }

      navigate('/')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-3">Create an account</h1>
      <p className="text-gray-500 text-lg mb-10">Join the Barrio Base community</p>

      {error && <p className="text-red-500 text-sm mb-6">{error}</p>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="shrink-0 w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden cursor-pointer hover:border-[#3A8A8F] transition-colors"
          >
            {photoPreview ? (
              <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl text-gray-400">+</span>
            )}
          </button>
          <div>
            <p className="text-sm font-medium text-gray-700">Profile photo</p>
            <p className="text-xs text-gray-400 mt-0.5">Optional — JPG, PNG or WebP</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            onChange={handlePhotoChange}
            className="hidden"
          />
        </div>

        <FormField label="Username" type="text" value={username} onChange={setUsername} placeholder="yourname" minLength={2} required />
        <FormField label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" required />
        <FormField label="Password" type="password" value={password} onChange={setPassword} placeholder="Min. 8 characters" minLength={8} required />

        <button
          type="submit"
          disabled={loading}
          className="mt-2 py-3 rounded-lg text-white font-semibold cursor-pointer disabled:opacity-60"
          style={{ backgroundColor: '#FF9E0C' }}
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="text-sm text-center text-gray-500 mt-8">
        Already have an account?{' '}
        <Link to="/login" className="text-[#3A8A8F] font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
