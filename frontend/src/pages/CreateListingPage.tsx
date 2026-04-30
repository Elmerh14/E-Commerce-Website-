import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Container from '../components/Container'
import CreateListingForm from '../components/CreateListingForm'

export default function CreateListingPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) navigate('/login')
  }, [user, loading, navigate])

  if (loading || !user) return null

  return (
    <div className="bg-gray-50 py-6">
      <Container>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12">
          <CreateListingForm />
        </div>
      </Container>
    </div>
  )
}
