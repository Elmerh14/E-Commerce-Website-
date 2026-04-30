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
              <img src={icon} alt={title} className="w-16 h-16 md:w-24 md:h-24" />
              <p className="font-semibold text-[12px] md:text-[24px]">{title}</p>
              <p
                className="text-black leading-relaxed whitespace-pre-line text-[10px] md:text-[16px]"
                style={{ fontFamily: 'Inter, sans-serif' }}
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
