export default function Logo({ size = 'md' }) {
  const sizes = { sm: 'w-7 h-7', md: 'w-9 h-9', lg: 'w-12 h-12' }
  return (
    <div className={`${sizes[size]} flex items-center justify-center`}>
      <svg viewBox="0 0 32 32" className="w-full h-full">
        <defs>
          <linearGradient id="logoGradient" x1="5" y1="4" x2="27" y2="27" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FF9A7F" />
            <stop offset="1" stopColor="#F25F4C" />
          </linearGradient>
        </defs>
        <path d="M9 21 C4 21 2 17 2 14 C2 11 4 8 7 8 C7 5 10 2 15 2 C20 2 23 5 23 8 C26 8 28 11 28 14 C28 17 26 21 22 21 Z" fill="url(#logoGradient)" opacity="0.12" />
        <path d="M9 21 C4 21 2 17 2 14 C2 11 4 8 7 8 C7 5 10 2 15 2 C20 2 23 5 23 8 C26 8 28 11 28 14 C28 17 26 21 22 21 Z" fill="none" stroke="url(#logoGradient)" strokeWidth="1.6" strokeLinejoin="round" />
        <ellipse cx="15" cy="17" rx="4" ry="3" fill="#FF7A59" opacity="0.24" />
        <ellipse cx="11" cy="13" rx="2" ry="2.3" fill="#FF7A59" opacity="0.36" />
        <ellipse cx="15" cy="11" rx="2" ry="2.3" fill="#12B886" opacity="0.32" />
        <ellipse cx="19" cy="13" rx="2" ry="2.3" fill="#FF7A59" opacity="0.36" />
      </svg>
    </div>
  )
}
