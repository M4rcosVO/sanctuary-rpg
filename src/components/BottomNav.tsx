import type React from 'react'
import { Home, Crosshair, Briefcase, Activity, Plus } from 'lucide-react'

export type NavTab = 'home' | 'arsenal' | 'inventory' | 'tactical'

interface BottomNavProps {
  currentTab: NavTab
  onSelectTab: (tab: NavTab) => void
  onDiceRollClick: () => void
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  onDiceRollClick,
}) => {
  const navItems = [
    { id: 'home' as NavTab, label: 'Ficha', icon: Home },
    { id: 'arsenal' as NavTab, label: 'Arsenal', icon: Crosshair },
    { id: 'inventory' as NavTab, label: 'Inventário', icon: Briefcase },
    { id: 'tactical' as NavTab, label: 'Tático', icon: Activity },
  ]

  const firstHalf = navItems.slice(0, 2)
  const secondHalf = navItems.slice(2, 4)

  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 px-4 pointer-events-none flex justify-center">
      <nav
        aria-label="Navegação Principal"
        className="pointer-events-auto relative flex items-center justify-between w-full max-w-md bg-[#1a181d]/95 backdrop-blur-xl border border-white/10 rounded-3xl px-3 py-2 shadow-2xl shadow-black/80"
      >
        {/* Lado Esquerdo: Ficha & Arsenal */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {firstHalf.map((item) => {
            const Icon = item.icon
            const isActive = currentTab === item.id

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`relative flex flex-col items-center justify-center p-2.5 rounded-2xl transition-all duration-200 group ${
                  isActive
                    ? 'text-red-500 scale-105'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }`}
                aria-label={item.label}
              >
                <Icon
                  size={22}
                  className={`transition-all duration-200 ${
                    isActive ? 'drop-shadow-[0_0_10px_rgba(239,68,68,0.7)]' : ''
                  }`}
                />
                <span
                  className={`text-[10px] font-medium tracking-tight mt-0.5 transition-colors ${
                    isActive ? 'text-red-400 font-semibold' : 'text-zinc-500 group-hover:text-zinc-300'
                  }`}
                >
                  {item.label}
                </span>

                {isActive && (
                  <span className="absolute -bottom-0.5 w-3 h-0.5 bg-red-600 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.9)]" />
                )}
              </button>
            )
          })}
        </div>

        {/* Botão Central Elevado (Ação Rápida / Rolador de Dados) */}
        <div className="relative -top-5 flex flex-col items-center">
          <button
            type="button"
            onClick={onDiceRollClick}
            className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-red-700 via-red-600 to-red-500 text-white shadow-[0_0_20px_rgba(255,0,0,0.8)] hover:shadow-[0_0_30px_rgba(255,0,0,1)] active:scale-95 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-400/50"
            aria-label="Rolar Dados / Ação Rápida"
            title="Rolar Dados (D20, D6...)"
          >
            <span className="absolute inset-0 rounded-full bg-red-500/30 animate-ping opacity-50 group-hover:opacity-75 pointer-events-none" />
            <Plus
              size={28}
              strokeWidth={2.5}
              className="relative z-10 transition-transform duration-300 group-hover:rotate-90 group-hover:scale-110"
            />
          </button>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-red-400/90 mt-1 pointer-events-none drop-shadow">
            Dados
          </span>
        </div>

        {/* Lado Direito: Inventário & Tático */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {secondHalf.map((item) => {
            const Icon = item.icon
            const isActive = currentTab === item.id

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`relative flex flex-col items-center justify-center p-2.5 rounded-2xl transition-all duration-200 group ${
                  isActive
                    ? 'text-red-500 scale-105'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }`}
                aria-label={item.label}
              >
                <Icon
                  size={22}
                  className={`transition-all duration-200 ${
                    isActive ? 'drop-shadow-[0_0_10px_rgba(239,68,68,0.7)]' : ''
                  }`}
                />
                <span
                  className={`text-[10px] font-medium tracking-tight mt-0.5 transition-colors ${
                    isActive ? 'text-red-400 font-semibold' : 'text-zinc-500 group-hover:text-zinc-300'
                  }`}
                >
                  {item.label}
                </span>

                {isActive && (
                  <span className="absolute -bottom-0.5 w-3 h-0.5 bg-red-600 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.9)]" />
                )}
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
export default BottomNav
