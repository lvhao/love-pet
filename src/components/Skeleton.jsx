function SkeletonBase({ width, height, radius = 'md', className = '', style = {} }) {
  const radiusMap = { sm: '4px', md: '8px', lg: '12px', xl: '16px', full: '9999px' }
  return (
    <div
      className={`skeleton-shimmer ${className}`}
      style={{
        width,
        height,
        borderRadius: radiusMap[radius] || radius,
        background: 'var(--skeleton-bg, rgba(0,0,0,0.06))',
        ...style,
      }}
    />
  )
}

function SkeletonText({ width = '100%', height = '14px', className = '' }) {
  return <SkeletonBase width={width} height={height} radius="sm" className={className} />
}

function SkeletonCircle({ size = 40, className = '' }) {
  return <SkeletonBase width={size} height={size} radius="full" className={className} />
}

function SkeletonCard({ className = '' }) {
  return (
    <div className={`bg-surface rounded-xl p-3.5 ${className}`}>
      <div className="flex items-center gap-3.5">
        <SkeletonCircle size={40} />
        <div className="flex-1 space-y-2">
          <SkeletonText width="60%" height="14px" />
          <SkeletonText width="40%" height="12px" />
        </div>
        <SkeletonText width="48px" height="14px" />
      </div>
    </div>
  )
}

function SkeletonOrderRow({ className = '' }) {
  return (
    <div className={`py-3 flex items-center gap-3 ${className}`}>
      <SkeletonCircle size={36} />
      <div className="flex-1 space-y-2">
        <SkeletonText width="50%" height="14px" />
        <SkeletonText width="70%" height="12px" />
      </div>
      <SkeletonText width="60px" height="20px" />
    </div>
  )
}

function SkeletonProductCard({ className = '' }) {
  return (
    <div className={`bg-surface rounded-xl border border-border overflow-hidden ${className}`}>
      <div className="aspect-square" style={{ background: 'rgba(0,0,0,0.04)' }} />
      <div className="p-2.5 space-y-2">
        <SkeletonText width="80%" height="12px" />
        <SkeletonText width="50%" height="11px" />
        <div className="flex items-end justify-between mt-1.5">
          <SkeletonText width="40px" height="14px" />
          <SkeletonBase width={28} height={28} radius="md" />
        </div>
      </div>
    </div>
  )
}

const Skeleton = SkeletonBase
Skeleton.Text = SkeletonText
Skeleton.Circle = SkeletonCircle
Skeleton.Card = SkeletonCard
Skeleton.OrderRow = SkeletonOrderRow
Skeleton.ProductCard = SkeletonProductCard

export default Skeleton
