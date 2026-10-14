import { useState, type FC } from 'react'
import { Sparkles, Shield, Heart, Zap, ArrowRight, UserPlus, Check, ChevronLeft, Lock, AlertTriangle } from 'lucide-react'
import type { Character, SystemType } from '../../types/character'

interface CharacterSelectViewProps {
  currentSystem: SystemType
  characters: Character[]
  selectedCharacterId: string
  onSelectCharacter: (characterId: string) => void
  onCreateNewCharacter: () => void
  onBackToSystemSelect: () => void
}

export const CharacterSelectView: FC<CharacterSelectViewProps> = ({
  currentSystem,
  characters,
  selectedCharacterId,
  onSelectCharacter,
  onCreateNewCharacter,
  onBackToSystemSelect,
}) => {
  // Personagens compatíveis com o sistema ativo
  const compatibleCharacters = characters.filter((c) => c.system === currentSystem)
  const incompatibleCharacters = characters.filter((c) => c.system !== currentSystem)

  // Seleciona inicialmente um compatível se disponível
  const [chosenId, setChosenId] = useState<string>(
    compatibleCharacters.find((c) => c.id === selectedCharacterId)?.id ||
      compatibleCharacters[0]?.id ||
      ''
  )

  const handleConfirm = () => {
    if (!chosenId) return
    const char = characters.find((c) => c.id === chosenId)
    if (char && char.system !== currentSystem) return
    onSelectCharacter(chosenId)
  }

  const systemNames: Record<SystemType, string> = {
    dnd5e: 'D&D 5e',
    t20: 'Tormenta20',
    ordem: 'Ordem Paranormal',
    custom: 'Customizado',
  }

  return (
    <div className="relative min-h-screen w-full bg-black text-white flex flex-col justify-between items-center px-4 py-8 overflow-x-hidden">
      {/* Luz ambiente de fundo carmesim */}
      <div className="pointer-events-none fixed -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-red-950/25 rounded-full blur-3xl z-0" />
      <div className="pointer-events-none fixed bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-64 bg-red-900/15 rounded-full blur-3xl z-0" />

      {/* Topo */}
      <div className="relative z-10 w-full max-w-md mx-auto text-center pt-2">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-950/70 border border-red-800/40 text-red-300 text-[11px] font-semibold uppercase tracking-wider mb-2">
          <Sparkles size={12} className="text-red-400" />
          <span>Etapa 2 • Seleção de Personagem ({systemNames[currentSystem]})</span>
        </div>
        <h1
          className="text-2xl sm:text-3xl font-black tracking-wide text-white"
          style={{ fontFamily: "'Cinzel', serif" }}
        >
          Selecione seu Personagem
        </h1>

        {/* Banner com a Diretriz de Acesso */}
        <div className="mt-3 p-3 rounded-2xl bg-[#141217] border border-red-900/40 text-left flex items-start space-x-2.5">
          <AlertTriangle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-zinc-300 leading-relaxed">
            <strong className="text-white">Regra de Acesso do Santuário:</strong> Personagens são estritamente vinculados ao sistema para o qual foram forjados.
          </p>
        </div>
      </div>

      {/* Lista de Personagens */}
      <div className="relative z-10 w-full max-w-md mx-auto space-y-3.5 my-6">
        {/* Personagens Compatíveis */}
        {compatibleCharacters.map((char) => {
          const isSelected = chosenId === char.id

          return (
            <div
              key={char.id}
              onClick={() => setChosenId(char.id)}
              className={`relative rounded-3xl border p-5 cursor-pointer transition-all duration-200 overflow-hidden ${
                isSelected
                  ? 'bg-gradient-to-br from-[#1e1724] via-[#141217] to-black border-red-600 shadow-[0_0_25px_rgba(255,0,0,0.4)] scale-[1.01]'
                  : 'bg-[#131116]/80 hover:bg-[#1a171e] border-white/10 hover:border-red-900/50'
              }`}
            >
              {isSelected && (
                <div className="pointer-events-none absolute -right-10 -bottom-10 w-36 h-36 rounded-full bg-red-600/20 blur-2xl" />
              )}

              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3.5">
                  <div className="relative w-16 h-16 rounded-2xl bg-black border border-red-800/60 shadow-[0_0_15px_rgba(255,0,0,0.3)] flex items-center justify-center overflow-hidden flex-shrink-0">
                    <img
                      src="/helm.png"
                      alt={char.name}
                      className="w-13 h-13 object-contain filter drop-shadow"
                    />
                    <span className="absolute bottom-0.5 right-0.5 px-1 py-0.2 rounded bg-red-700 text-[9px] font-bold text-white">
                      Nv. {char.level}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-950 border border-red-800/50 text-red-300">
                        {char.systemName}
                      </span>
                    </div>
                    <h3
                      className="text-lg font-black text-white mt-0.5"
                      style={{ fontFamily: "'Cinzel', serif" }}
                    >
                      {char.name}
                    </h3>
                    <p className="text-xs text-zinc-400 font-medium">
                      {char.concept}
                    </p>
                  </div>
                </div>

                <div
                  className={`w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0 transition-all ${
                    isSelected
                      ? 'border-red-500 bg-red-600 text-white shadow-[0_0_8px_rgba(255,0,0,0.6)]'
                      : 'border-zinc-700 bg-black/40 text-transparent'
                  }`}
                >
                  <Check size={14} strokeWidth={3} />
                </div>
              </div>

              {/* Status Rápido: PV, CA, Deslocamento */}
              <div className="mt-4 pt-3.5 border-t border-white/10 grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-2xl bg-black/50 border border-white/5">
                  <span className="text-[9px] uppercase tracking-wider text-zinc-500 flex items-center justify-center space-x-1">
                    <Heart size={10} className="text-red-500 fill-red-500" />
                    <span>Pontos de Vida</span>
                  </span>
                  <div className="text-sm font-bold text-white mt-0.5">
                    <span className="text-red-400">{char.hp.current}</span> / {char.hp.max}
                  </div>
                </div>

                <div className="p-2 rounded-2xl bg-black/50 border border-white/5">
                  <span className="text-[9px] uppercase tracking-wider text-zinc-500 flex items-center justify-center space-x-1">
                    <Shield size={10} className="text-zinc-400" />
                    <span>Armadura</span>
                  </span>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {char.ca} CA
                  </div>
                </div>

                <div className="p-2 rounded-2xl bg-black/50 border border-white/5">
                  <span className="text-[9px] uppercase tracking-wider text-zinc-500 flex items-center justify-center space-x-1">
                    <Zap size={10} className="text-amber-400 fill-amber-400" />
                    <span>Deslocamento</span>
                  </span>
                  <div className="text-sm font-bold text-amber-400 mt-0.5">
                    {char.speed}
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {/* Personagens Incompatíveis (Bloqueados pela Regra do Sistema) */}
        {incompatibleCharacters.map((char) => (
          <div
            key={char.id}
            className="relative rounded-3xl border border-white/5 bg-zinc-950/60 p-4 opacity-50 select-none"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-black/80 border border-white/10 flex items-center justify-center text-zinc-600">
                  <Lock size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-300">{char.name}</h4>
                  <span className="text-[11px] text-zinc-500 block">
                    {char.concept} • Vinculado a {char.systemName}
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-red-950/40 border border-red-900/30 text-red-400 text-[10px] font-bold">
                Incompatível com {systemNames[currentSystem]}
              </span>
            </div>
          </div>
        ))}

        {/* Botão + Criar Novo Personagem para o Sistema Atual */}
        <button
          type="button"
          onClick={onCreateNewCharacter}
          className="w-full p-4 rounded-3xl border border-dashed border-red-800/40 hover:border-red-600 bg-black/30 hover:bg-red-950/20 text-zinc-400 hover:text-red-300 transition-all flex items-center justify-center space-x-2 group"
        >
          <div className="p-2 rounded-xl bg-zinc-900 border border-white/10 text-red-400 group-hover:scale-110 transition-transform">
            <UserPlus size={18} />
          </div>
          <span className="text-sm font-bold uppercase tracking-wider">
            + Criar Novo Personagem em {systemNames[currentSystem]}
          </span>
        </button>
      </div>

      {/* Ações Inferiores */}
      <div className="relative z-10 w-full max-w-md mx-auto space-y-2">
        <button
          type="button"
          disabled={!chosenId || !compatibleCharacters.some((c) => c.id === chosenId)}
          onClick={handleConfirm}
          className="w-full py-4 px-6 rounded-full bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold tracking-wider text-sm uppercase shadow-[0_0_25px_rgba(255,0,0,0.7)] hover:shadow-[0_0_35px_rgba(255,0,0,0.95)] active:scale-98 transition-all duration-300 flex items-center justify-center space-x-2"
        >
          <span>Acessar Ficha do Personagem</span>
          <ArrowRight size={18} />
        </button>

        <button
          type="button"
          onClick={onBackToSystemSelect}
          className="w-full text-center text-xs text-zinc-500 hover:text-zinc-300 py-1 transition-colors flex items-center justify-center space-x-1"
        >
          <ChevronLeft size={14} />
          <span>Alterar Sistema Selecionado</span>
        </button>
      </div>
    </div>
  )
}

export default CharacterSelectView
