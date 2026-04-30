import Container from '../components/Container'
import RegisterForm from '../components/RegisterForm'

export default function RegisterPage() {
  return (
    <div className="bg-gray-50 py-6">
      <Container>
        <div
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 flex items-start justify-center pt-16"
          style={{ minHeight: 'calc(100vh - 120px)' }}
        >
          <div className="w-full max-w-xl">
            <RegisterForm />
          </div>
        </div>
      </Container>
    </div>
  )
}
