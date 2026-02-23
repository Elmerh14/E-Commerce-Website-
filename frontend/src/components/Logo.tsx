import logo from '../assets/barrio_base_logo.svg'

interface Props {
  className?: string
}
export default function Logo({ className }: Props) {
  return (
    <img src={logo} alt='Barrio Base logo used for.' className={className} />
  )
}
