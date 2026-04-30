interface Props {
  label: string
  type: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minLength?: number
  required?: boolean
}

export default function FormField({ label, type, value, onChange, placeholder, minLength, required }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-base font-medium text-gray-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        minLength={minLength}
        required={required}
        className="border border-gray-200 rounded-lg px-4 py-3 text-base outline-none focus:border-[#3A8A8F] transition-colors"
      />
    </div>
  )
}
