import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import FormField from './FormField'

export default function LoginForm() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-3">Welcome back</h1>
      <p className="text-gray-500 text-lg mb-10">Sign in to your Barrio Base account</p>

      {error && <p className="text-red-500 text-sm mb-6">{error}</p>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <FormField label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" required />
        <FormField label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" required />
        <button
          type="submit"
          disabled={loading}
          className="mt-2 py-3 rounded-lg text-white font-semibold cursor-pointer disabled:opacity-60"
          style={{ backgroundColor: '#FF9E0C' }}
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className="text-sm text-center text-gray-500 mt-8">
        Don't have an account?{' '}
        <Link to="/register" className="text-[#3A8A8F] font-medium hover:underline">
          Register
        </Link>
      </p>
    </div>
  )
}
