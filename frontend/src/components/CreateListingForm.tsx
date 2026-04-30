import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { API_URL } from '../lib/api'
import FormField from './FormField'

const CATEGORIES = ['Auto', 'Clothing', 'Electronics', 'Home', 'Kids', 'Tools']
const MAX_PHOTOS = 5

export default function CreateListingForm() {
  const { accessToken } = useAuth()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [type, setType] = useState('SELL')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [condition, setCondition] = useState('NEW')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [price, setPrice] = useState('')
  const [photos, setPhotos] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const remaining = MAX_PHOTOS - photos.length
    const toAdd = files.slice(0, remaining)
    setPhotos((prev) => [...prev, ...toAdd])
    setPreviews((prev) => [...prev, ...toAdd.map((f) => URL.createObjectURL(f))])
    e.target.value = ''
  }

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const body: Record<string, unknown> = { type, title, category, condition, description, location }
      if (type !== 'BARTER') body.price = parseFloat(price)

      const res = await fetch(`${API_URL}/api/listings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error?.[0]?.message ?? data.error ?? 'Failed to create listing')

      const listingId = data.listing.id

      for (let i = 0; i < photos.length; i++) {
        const file = photos[i]
        const presignRes = await fetch(`${API_URL}/api/listings/${listingId}/images/presign`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify({ contentType: file.type }),
        })
        if (!presignRes.ok) continue
        const { uploadUrl, imageUrl } = await presignRes.json()
        await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })
        await fetch(`${API_URL}/api/listings/${listingId}/images`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify({ imageUrl, sortOrder: i }),
        })
      }

      navigate(`/listings/${listingId}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-3">Create a listing</h1>
      <p className="text-gray-500 text-lg mb-10">Fill in the details about what you're selling or trading</p>

      {error && <p className="text-red-500 text-sm mb-6">{error}</p>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">

        {/* Photo slots */}
        <div>
          <p className="text-base font-medium text-gray-700 mb-3">Photos <span className="text-gray-400 font-normal">(up to {MAX_PHOTOS})</span></p>
          <div className="flex gap-3 flex-wrap">
            {previews.map((src, i) => (
              <div key={i} className="relative w-28 h-28 rounded-xl overflow-hidden">
                <img src={src} alt={`photo ${i + 1}`} className="w-full h-full object-cover" />
                {i === 0 && (
                  <span className="absolute bottom-0 left-0 right-0 text-center text-white text-xs bg-black/40 py-0.5">Cover</span>
                )}
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs cursor-pointer"
                >
                  ×
                </button>
              </div>
            ))}
            {photos.length < MAX_PHOTOS && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-28 h-28 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-3xl text-gray-400 hover:border-[#3A8A8F] transition-colors cursor-pointer bg-[#F1F5F9]"
              >
                +
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            multiple
            onChange={handlePhotoAdd}
            className="hidden"
          />
        </div>

        {/* Fields grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <FormField label="Title" type="text" value={title} onChange={setTitle} placeholder="What are you listing?" required />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-base font-medium text-gray-700">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="border border-gray-200 rounded-lg px-4 py-3 text-base outline-none focus:border-[#3A8A8F] transition-colors bg-white"
            >
              <option value="SELL">Selling</option>
              <option value="BARTER">Barter</option>
              <option value="BOTH">Selling & Barter</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-base font-medium text-gray-700">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border border-gray-200 rounded-lg px-4 py-3 text-base outline-none focus:border-[#3A8A8F] transition-colors bg-white"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-base font-medium text-gray-700">Condition</label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="border border-gray-200 rounded-lg px-4 py-3 text-base outline-none focus:border-[#3A8A8F] transition-colors bg-white"
            >
              <option value="NEW">New</option>
              <option value="LIKE_NEW">Like New</option>
              <option value="GOOD">Good</option>
              <option value="FAIR">Fair</option>
              <option value="POOR">Poor</option>
            </select>
          </div>

          {type !== 'BARTER' && (
            <FormField
              label="Price ($)"
              type="number"
              value={price}
              onChange={setPrice}
              placeholder="0.00"
              required
            />
          )}

          <div className={type !== 'BARTER' ? '' : 'md:col-span-2'}>
            <FormField label="Location" type="text" value={location} onChange={setLocation} placeholder="City, neighbourhood…" required />
          </div>

          <div className="md:col-span-2 flex flex-col gap-1">
            <label className="text-base font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your item — condition details, what's included, trade preferences…"
              required
              maxLength={255}
              rows={4}
              className="border border-gray-200 rounded-lg px-4 py-3 text-base outline-none focus:border-[#3A8A8F] transition-colors resize-none"
            />
            <p className="text-xs text-gray-400 text-right">{description.length}/255</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="py-3 rounded-xl text-white font-semibold text-base cursor-pointer disabled:opacity-60"
          style={{ backgroundColor: '#FF9E0C' }}
        >
          {loading ? 'Publishing...' : 'Publish listing'}
        </button>
      </form>
    </div>
  )
}
