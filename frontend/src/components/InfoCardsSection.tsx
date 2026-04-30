import Container from './Container'
import barterIcon from '../assets/barterInfoCard.svg'
import saleIcon from '../assets/saleInfoCard.svg'
import marketIcon from '../assets/marketInfoCard.svg'

const cards = [
  {
    icon: barterIcon,
    title: 'Barter',
    description: 'Trade what you have for what you need,\nno cash required.',
  },
  {
    icon: saleIcon,
    title: 'Sell',
    description: 'Turn your listings into profit,\nhassle free.',
  },
  {
    icon: marketIcon,
    title: 'Buy',
    description: 'Find great deals on everyday items right in your community.',
  },
]

export default function InfoCardsSection() {
  return (
    <section className="py-14">
      <Container>
        <div className="flex justify-between gap-8">
          {cards.map(({ icon, title, description }) => (
            <div key={title} className="flex flex-col items-center text-center gap-3 flex-1">
              <img src={icon} alt={title} className="w-24 h-24" />
              <p className="font-semibold" style={{ fontSize: '24px' }}>{title}</p>
              <p
                className="text-black leading-relaxed whitespace-pre-line"
                style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px' }}
              >
                {description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
