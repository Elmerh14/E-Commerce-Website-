import Container from '../components/Container'
import HeroSection from '../components/HeroSection'
import InfoCardsSection from '../components/InfoCardsSection'
import RecentDealsSection from '../components/RecentDealsSection'
import LatestBarterSection from '../components/LatestBarterSection'

export default function HomePage() {
  return (
    <div className="py-6">
      <Container>
        <HeroSection />
      </Container>
      <InfoCardsSection />
      <RecentDealsSection />
      <LatestBarterSection />
    </div>
  )
}
