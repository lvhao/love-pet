import { Cat, Dog, Bird, Fish, PawPrint } from 'lucide-react'

const iconMap = { cat: Cat, dog: Dog, bird: Bird, fish: Fish }
const colorMap = {
  cat: { bg: 'bg-cat-50', text: 'text-cat' },
  dog: { bg: 'bg-dog-50', text: 'text-dog' },
  bird: { bg: 'bg-grooming-50', text: 'text-grooming' },
  fish: { bg: 'bg-primary-50', text: 'text-primary' },
}

export default function PetAvatar({ type = 'cat', size = 'md' }) {
  const sizes = { sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-14 h-14' }
  const iconSizes = { sm: 14, md: 18, lg: 24 }
  const Icon = iconMap[type] || PawPrint
  const colors = colorMap[type] || colorMap.cat

  return (
    <div className={`${sizes[size]} rounded-lg ${colors.bg} flex items-center justify-center`}>
      <Icon size={iconSizes[size]} className={colors.text} strokeWidth={1.6} />
    </div>
  )
}