import { useState } from 'react'
import { Menu } from 'lucide-react'
import type { ReactNode } from 'react'
import Sidebar from './Sidebar'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-[#f8f8f8]">
      {/* Topbar burger — mobile/tablette uniquement */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-white border-b border-[#e5e7eb] flex items-center px-4 gap-3">
        <button
          type="button"
          aria-label="Ouvrir le menu"
          onClick={() => setMobileOpen(true)}
          className="size-9 flex items-center justify-center rounded-lg text-[#364153] hover:bg-[#f5f5f5] transition-colors"
        >
          <Menu size={22} />
        </button>
        <div className="flex items-center gap-2">
          <div className="logo-gradient w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white shrink-0">
            DC
          </div>
          <span className="text-base font-medium text-[#101828]">DictéeCorrige</span>
        </div>
      </header>

      {/* Backdrop drawer */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <Sidebar isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 mt-14 lg:mt-0 min-h-screen">
        <div className="max-w-300 mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
