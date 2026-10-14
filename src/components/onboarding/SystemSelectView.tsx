import { useState, type FC } from 'react'
import { Shield, Sparkles, BookOpen, Skull, Sliders, ArrowRight, Check } from 'lucide-react'
import type { SystemType } from '../../types/character'

interface SystemOption {
  id: SystemType
  name: string
  subtitle: string
  description: string
  icon: typeof Shield
  tag: string
}

interface SystemSelectViewProps {
  currentSystem: SystemType
  onSelectSystem: (system: SystemType) => void
  onBackToLogin?: () => void
}

export const SystemSelectView: FC<SystemSelectViewProps> = ({
  currentSystem,
  onSelectSystem,
  onBackToLogin,
}) => {
  const [selected, setSelected] = useState<SystemType>(currentSystem)

  const systems: SystemOption[] = [
    {
      id: 'dnd5e',
      name: 'D&D 5e',
      subtitle: 'Dungeons & Dragons 5ª Edição',
      description: 'O clássico sistema d20 de alta fantasia medieval, magias e masmorras.',
      icon: Shield,
      tag: 'd20 System',
    },
    {
      id: 't20',
      name: 'Tormenta20',
      subtitle: 'RPG de Alta Fantasia Brasileira',
      description: 'Heróis audazes em Arton lutando contra monstros épicos e a corrupção da Tormenta.',
      icon: BookOpen,
      tag: 'Fantasia Épica',
    },
    {
      id: 'ordem',
      name: 'Ordem Paranormal',
      subtitle: 'Investigação & Terror d20',
      description: 'Agentes da Ordem investigando e enfrentando o Outro Lado para proteger a Realidade.',
      icon: Skull,
      tag: 'Horror & Mistério',
    },
    {
      id: 'custom',
      name: 'Customizado',
      subtitle: 'Regras Livres & Homebrew',
      description: 'Configure regras próprias, atributos sob medida e inventário flexível.',
      icon: Sliders,
      tag: 'Sandbox',
    },
  ]

  const handleConfirm = () => {
    onSelectSystem(selected)
  }

  return (
    <div className="relative min-h-screen w-full bg-black text-white flex flex-col justify-between items-center px-4 py-8 overflow-x-hidden">
      {/* Luz ambiente de fundo carmesim */}
      <div className="pointer-events-none fixed -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-red-950/25 rounded-full blur-3xl z-0" />
      <div className="pointer-events-none fixed bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-64 bg-red-900/15 rounded-full blur-3xl z-0" />

      {/* Topo / Progresso */}
      <div className="relative z-10 w-full max-w-md mx-auto text-center pt-2">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-950/70 border border-red-800/40 text-red-300 text-[11px] font-semibold uppercase tracking-wider mb-2">
          <Sparkles size={12} className="text-red-400" />
          <span>Etapa 1 de 2 • Sistema de Regras</span>
        </div>
        <h1
          className="text-2xl sm:text-3xl font-black tracking-wide text-white"
          style={{ fontFamily: "'Cinzel', serif" }}
        >
          Escolha seu Sistema
        </h1>
        <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
          Selecione as regras para estruturar a ficha e as mecânicas do seu personagem no Santuário.
        </p>
      </div>

      {/* Grid de Opções de Sistemas */}
      <div className="relative z-10 w-full max-w-md mx-auto space-y-3 my-6">
        {systems.map((item) => {
          const Icon = item.icon
          const isChosen = selected === item.id

          return (
            <div
              key={item.id}
              onClick={() => setSelected(item.id)}
              className={`p-4 rounded-3xl border transition-all duration-200 cursor-pointer flex items-center justify-between group ${
                isChosen
                  ? 'bg-gradient-to-r from-red-950/80 to-[#1d1015] border-red-600 shadow-[0_0_20px_rgba(255,0,0,0.35)] scale-[1.01]'
                  : 'bg-[#131116]/80 hover:bg-[#1a171e] border-white/10 hover:border-red-900/50'
              }`}
            >
              <div className="flex items-start space-x-3.5">
                <div
                  className={`p-3 rounded-2xl border transition-colors mt-0.5 ${
                    isChosen
                      ? 'bg-red-600 text-white border-red-500 shadow-[0_0_12px_rgba(255,0,0,0.6)]'
                      : 'bg-black/60 text-zinc-400 border-white/10 group-hover:text-zinc-200 group-hover:border-red-900/40'
                  }`}
                >
                  <Icon size={20} />
                </div>

                <div className="text-left">
                  <div className="flex items-center space-x-2">
                    <span className="text-base font-bold text-white group-hover:text-red-400 transition-colors">
                      {item.name}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/50 border border-white/10 text-zinc-400 font-medium">
                      {item.tag}
                    </span>
                  </div>
                  <span className="text-xs text-zinc-300 font-medium block mt-0.5">
                    {item.subtitle}
                  </span>
                  <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed max-w-[250px]">
                    {item.description}
                  </p>
                </div>
              </div>

              <div
                className={`w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0 ml-2 transition-all ${
                  isChosen
                    ? 'border-red-500 bg-red-600 text-white shadow-[0_0_8px_rgba(255,0,0,0.6)]'
                    : 'border-zinc-700 bg-black/40 text-transparent'
                }`}
              >
                <Check size={14} strokeWidth={3} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Ações Inferiores */}
      <div className="relative z-10 w-full max-w-md mx-auto space-y-2">
        <button
          type="button"
          onClick={handleConfirm}
          className="w-full py-4 px-6 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold tracking-wider text-sm uppercase shadow-[0_0_25px_rgba(255,0,0,0.7)] hover:shadow-[0_0_35px_rgba(255,0,0,0.95)] active:scale-98 transition-all duration-300 flex items-center justify-center space-x-2"
        >
          <span>Continuar para Seleção de Personagem</span>
          <ArrowRight size={18} />
        </button>

        {onBackToLogin && (
          <button
            type="button"
            onClick={onBackToLogin}
            className="w-full text-center text-xs text-zinc-500 hover:text-zinc-300 py-1 transition-colors block"
          >
            ← Voltar para a Tela de Entrada
          </button>
        )}
      </div>
    </div>
  )
}

export default SystemSelectView
