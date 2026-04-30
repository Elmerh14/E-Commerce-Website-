import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { API_URL } from '../lib/api'
import FormField from './FormField'

const CATEGORIES = ['Auto', 'Clothing', 'Electronics', 'Home', 'Kids', 'Tools']

interface Props {
  listing: {
    id: number
    title: string
    price: string | null
    type: string
    condition: string
    description: string
    location: string
    category: string
    status: string
  }
}

export default function EditListingForm({ listing }: Props) {
  const { accessToken } = useAuth()
  const navigate = useNavigate()

  const [title, setTitle] = useState(listing.title)
  const [type, setType] = useState(listing.type)
  const [category, setCategory] = useState(listing.category)
  const [condition, setCondition] = useState(listing.condition)
  const [description, setDescription] = useState(listing.description)
  const [location, setLocation] = useState(listing.location)
  const [price, setPrice] = useState(listing.price ?? '')
  const [status, setStatus] = useState(listing.status)
  const [saveError, setSaveError] = useState('')
  const [saveLoading, setSaveLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveError('')
    setSaveLoading(true)
    setSaved(false)
    try {
      const body: Record<string, unknown> = { type, title, category, condition, description, location }
      if (type !== 'BARTER') body.price = parseFloat(price as string)

      const [editRes, statusRes] = await Promise.all([
        fetch(`${API_URL}/api/listings/${listing.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify(body),
        }),
        status !== listing.status
          ? fetch(`${API_URL}/api/listings/${listing.id}/status`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
              body: JSON.stringify({ status }),
            })
          : Promise.resolve(null),
      ])

      if (!editRes.ok) {
        const data = await editRes.json()
        throw new Error(data.error?.[0]?.message ?? data.error ?? 'Failed to save')
      }
      if (statusRes && !statusRes.ok) throw new Error('Failed to update status')

      setSaved(true)
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaveLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this listing? This cannot be undone.')) return
    setDeleteLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/listings/${listing.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (!res.ok) throw new Error('Failed to delete listing')
      navigate('/my-listings')
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Failed to delete')
      setDeleteLoading(false)
    }
  }

  return (
    <div className="mt-10 border-t border-gray-100 pt-10">
      <h2 className="text-xl font-bold mb-6">Edit your listing</h2>

      {saveError && <p className="text-red-500 text-sm mb-4">{saveError}</p>}
      {saved && <p className="text-green-600 text-sm mb-4">Changes saved.</p>}

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <FormField label="Title" type="text" value={title} onChange={setTitle} required />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-base font-medium text-gray-700">Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="border border-gray-200 rounded-lg px-4 py-3 text-base outline-none focus:border-[#3A8A8F] transition-colors bg-white">
              <option value="SELL">Selling</option>
              <option value="BARTER">Barter</option>
              <option value="BOTH">Selling & Barter</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-base font-medium text-gray-700">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="border border-gray-200 rounded-lg px-4 py-3 text-base outline-none focus:border-[#3A8A8F] transition-colors bg-white">
              {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-base font-medium text-gray-700">Condition</label>
            <select value={condition} onChange={(e) => setCondition(e.target.value)} className="border border-gray-200 rounded-lg px-4 py-3 text-base outline-none focus:border-[#3A8A8F] transition-colors bg-white">
              <option value="NEW">New</option>
              <option value="LIKE_NEW">Like New</option>
              <option value="GOOD">Good</option>
              <option value="FAIR">Fair</option>
              <option value="POOR">Poor</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-base font-medium text-gray-700">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="border border-gray-200 rounded-lg px-4 py-3 text-base outline-none focus:border-[#3A8A8F] transition-colors bg-white">
              <option value="ACTIVE">Active</option>
              <option value="SOLD">Sold</option>
              <option value="TRADED">Traded</option>
              <option value="REMOVED">Removed</option>
            </select>
          </div>

          {type !== 'BARTER' && (
            <FormField label="Price ($)" type="number" value={price as string} onChange={setPrice} placeholder="0.00" required />
          )}

          <div className={type !== 'BARTER' ? '' : 'md:col-span-2'}>
            <FormField label="Location" type="text" value={location} onChange={setLocation} required />
          </div>

          <div className="md:col-span-2 flex flex-col gap-1">
            <label className="text-base font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              maxLength={255}
              rows={4}
              className="border border-gray-200 rounded-lg px-4 py-3 text-base outline-none focus:border-[#3A8A8F] transition-colors resize-none"
            />
            <p className="text-xs text-gray-400 text-right">{description.length}/255</p>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saveLoading}
            className="flex-1 py-3 rounded-xl text-white font-semibold cursor-pointer disabled:opacity-60"
            style={{ backgroundColor: '#FF9E0C' }}
          >
            {saveLoading ? 'Saving...' : 'Save changes'}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteLoading}
            className="px-6 py-3 rounded-xl text-white font-semibold cursor-pointer disabled:opacity-60 bg-red-500 hover:bg-red-600 transition-colors"
          >
            {deleteLoading ? 'Deleting...' : 'Delete listing'}
          </button>
        </div>
      </form>
    </div>
  )
}
