import { Cat, Dog, Fish, Package, Sparkles } from 'lucide-react'
import PropTypes from 'prop-types'

const productPalettes = {
  cat_food: {
    shell: 'shop-art-peach',
    accent: '#d88970',
    soft: '#f4d8c9',
    Icon: Cat,
    mark: Fish,
    label: '主食',
  },
  dog_food: {
    shell: 'shop-art-sage',
    accent: '#8c9f7a',
    soft: '#d8e4cf',
    Icon: Dog,
    mark: Package,
    label: '主食',
  },
  cat_toy: {
    shell: 'shop-art-blue',
    accent: '#7d99ad',
    soft: '#d5e2e8',
    Icon: Sparkles,
    mark: Cat,
    label: '互动',
  },
  dog_toy: {
    shell: 'shop-art-apricot',
    accent: '#c99668',
    soft: '#ecd9bf',
    Icon: Dog,
    mark: Sparkles,
    label: '互动',
  },
}

export default function ProductArt({ product, size = 'card' }) {
  const palette = productPalettes[product.category] || productPalettes.cat_food
  const MainIcon = palette.Icon
  const MarkIcon = palette.mark
  const isDetail = size === 'detail'
  const brand = product.brand || product.name

  return (
    <div className={`shop-product-art ${palette.shell} ${isDetail ? 'shop-product-art-detail' : ''}`}>
      <div className="shop-art-orbit shop-art-orbit-one" />
      <div className="shop-art-orbit shop-art-orbit-two" />
      <div className="shop-pack-shot" aria-hidden="true">
        <div className="shop-pack-top" />
        <div className="shop-pack-label" style={{ background: palette.soft }}>
          <MainIcon size={isDetail ? 34 : 24} strokeWidth={1.8} style={{ color: palette.accent }} />
        </div>
        <div className="shop-pack-brand">{brand.slice(0, 12)}</div>
        <div className="shop-pack-kind">{palette.label}</div>
      </div>
      <div className="shop-art-token" aria-hidden="true">
        <MarkIcon size={isDetail ? 24 : 18} strokeWidth={1.8} style={{ color: palette.accent }} />
      </div>
    </div>
  )
}

ProductArt.propTypes = {
  product: PropTypes.shape({
    brand: PropTypes.string,
    category: PropTypes.string,
    name: PropTypes.string.isRequired,
  }).isRequired,
  size: PropTypes.oneOf(['card', 'detail']),
}
