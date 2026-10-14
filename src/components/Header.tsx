import type React from 'react'
import { Settings } from 'lucide-react'

interface HeaderProps {
  title: string
  onOpenSettings: () => void
  onLogoClick?: () => void
}

export const Header: React.FC<HeaderProps> = ({
  title,
  onOpenSettings,
  onLogoClick,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-black/85 backdrop-blur-md border-b border-white/10 px-4 py-3.5 transition-colors">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Lado Esquerdo: Ícone pequeno do elmo */}
        <button
          type="button"
          onClick={onLogoClick}
          className="flex items-center space-x-2 group focus:outline-none"
          title="Santuário Home"
        >
          <div className="relative w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-zinc-900 border border-white/10 group-hover:border-red-600/50 transition-colors shadow-[0_0_10px_rgba(255,0,0,0.2)]">
            <img
              src="/helm.png"
              alt="Santuário Elmo Logo"
              className="w-7 h-7 object-contain group-hover:scale-110 transition-transform duration-200"
            />
          </div>
        </button>

        {/* Centro: Título da tela ativa */}
        <div className="flex-1 text-center px-2">
          <h1
            className="text-lg font-bold tracking-wider text-zinc-100 uppercase"
            style={{ fontFamily: "'Cinzel', serif, system-ui" }}
          >
            {title}
          </h1>
        </div>

        {/* Lado Direito: Ícone de engrenagem para export/import JSON */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="relative p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-red-500"
          title="Configurações & Backup JSON"
          aria-label="Configurações e Backup JSON"
        >
          <Settings size={20} className="hover:rotate-45 transition-transform duration-300" />
        </button>
      </div>
    </header>
  )
}

export default Header
