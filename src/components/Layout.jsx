import { ArrowLeft } from 'lucide-react'

export default function Layout({ children, title, showBack = false, onBack, right }) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="app-header sticky top-0 z-50 flex items-center justify-between px-4 h-11 bg-surface/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-2 w-8">
          {showBack && (
            <button onClick={onBack} className="app-icon-button w-8 h-8 flex items-center justify-center -ml-2 active:opacity-50 transition-opacity cursor-pointer">
              <ArrowLeft size={20} className="text-text" />
            </button>
          )}
        </div>
        <h1 className="text-[17px] font-semibold text-text">{title}</h1>
        <div className="w-8 flex items-center justify-end">
          {right}
        </div>
      </header>
      <main className="app-page flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
