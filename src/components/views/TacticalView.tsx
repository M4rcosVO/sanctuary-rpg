import type { FC } from 'react'
import {
  Activity,
  Sparkles,
  AlertOctagon,
  Wrench,
  CheckCircle2,
  Minus,
  Plus,
  RotateCcw,
  Zap,
} from 'lucide-react'
import type { Character } from '../../types/character'

interface TacticalViewProps {
  tacticalState: Character['tacticalState']
  onUpdateTacticalState: (updater: (prev: Character['tacticalState']) => Character['tacticalState']) => void
}

export const TacticalView: FC<TacticalViewProps> = ({
  tacticalState,
  onUpdateTacticalState,
}) => {
  const allConditions = [
    { id: 'caido', name: 'Caído (Prone)', desc: 'Desvantagem em ataques; ataques corpo a corpo contra você têm vantagem.' },
    { id: 'cego', name: 'Cego (Blinded)', desc: 'Falha automática em testes visuais; ataques contra você têm vantagem.' },
    { id: 'envenenado', name: 'Envenenado (Poisoned)', desc: 'Desvantagem em jogadas de ataque e testes de habilidade.' },
    { id: 'amedrontado', name: 'Amedrontado (Frightened)', desc: 'Desvantagem em testes enquanto a fonte estiver em linha de visão.' },
    { id: 'incapacitado', name: 'Incapacitado (Incapacitated)', desc: 'Não pode realizar ações nem reações.' },
    { id: 'paralisado', name: 'Paralisado (Paralyzed)', desc: 'Incapacitado, falha em salvaguardas FOR/DES, acertos a 1.5m são críticos.' },
    { id: 'atordoado', name: 'Atordoado (Stunned)', desc: 'Incapacitado, fala vacilante, ataques contra você têm vantagem.' },
    { id: 'invisivel', name: 'Invisível (Invisible)', desc: 'Ataques contra você têm desvantagem; seus ataques têm vantagem.' },
    { id: 'impedido', name: 'Impedido (Restrained)', desc: 'Deslocamento 0, desvantagem em testes de DES.' },
  ]

  const toggleCondition = (conditionId: string) => {
    onUpdateTacticalState((prev) => {
      const exists = prev.activeConditions.includes(conditionId)
      const next = exists
        ? prev.activeConditions.filter((c) => c !== conditionId)
        : [...prev.activeConditions, conditionId]
      return { ...prev, activeConditions: next }
    })
  }

  const toggleInspiration = () => {
    onUpdateTacticalState((prev) => ({
      ...prev,
      inspiration: !prev.inspiration,
    }))
  }

  const updateGadgetSlots = (delta: number) => {
    onUpdateTacticalState((prev) => ({
      ...prev,
      gadgetSlots: {
        ...prev.gadgetSlots,
        current: Math.min(
          prev.gadgetSlots.max,
          Math.max(0, prev.gadgetSlots.current + delta)
        ),
      },
    }))
  }

  const updateInfusions = (delta: number) => {
    onUpdateTacticalState((prev) => ({
      ...prev,
      infusionsActive: {
        ...prev.infusionsActive,
        current: Math.min(
          prev.infusionsActive.max,
          Math.max(0, prev.infusionsActive.current + delta)
        ),
      },
    }))
  }

  const resetResources = () => {
    onUpdateTacticalState((prev) => ({
      ...prev,
      gadgetSlots: { ...prev.gadgetSlots, current: prev.gadgetSlots.max },
      infusionsActive: { ...prev.infusionsActive, current: prev.infusionsActive.max },
      activeConditions: [],
    }))
  }

  return (
    <div className="space-y-5 pb-28 animate-in fade-in duration-300">
      {/* Topo do Auxiliar Tático */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center space-x-2">
          <Activity size={16} className="text-red-500 animate-pulse" />
          <span className="text-xs font-bold text-zinc-300 tracking-wider uppercase">
            Painel Tático de Combate
          </span>
        </div>

        <button
          type="button"
          onClick={resetResources}
          className="flex items-center space-x-1 text-[11px] text-zinc-500 hover:text-red-400 transition-colors"
        >
          <RotateCcw size={12} />
          <span>Descanso Longo</span>
        </button>
      </div>

      {/* 1. CONTADOR DE RECURSOS RÁPIDOS */}
      <div className="grid grid-cols-2 gap-3">
        {/* Inspiração Heroica */}
        <div
          onClick={toggleInspiration}
          className={`p-4 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between ${tacticalState.inspiration
            ? 'bg-gradient-to-br from-amber-950/60 to-black border-amber-500/70 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
            : 'bg-[#141217] border-white/10 hover:border-white/20'
            }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-zinc-400">D&D 5e</span>
            <div
              className={`w-4 h-4 rounded-full border flex items-center justify-center ${tacticalState.inspiration
                ? 'border-amber-400 bg-amber-500 text-black shadow-[0_0_8px_rgba(245,158,11,0.9)]'
                : 'border-zinc-600 bg-black'
                }`}
            >
              {tacticalState.inspiration && <CheckCircle2 size={12} strokeWidth={3} />}
            </div>
          </div>

          <div className="my-2">
            <h4
              className={`text-base font-black ${tacticalState.inspiration ? 'text-amber-300' : 'text-white'
                }`}
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              Inspiração
            </h4>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              {tacticalState.inspiration ? 'Disponível para rolar com vantagem' : 'Gasta ou indisponível'}
            </p>
          </div>

          <span
            className={`text-[10px] font-bold uppercase tracking-wider ${tacticalState.inspiration ? 'text-amber-400' : 'text-zinc-500'
              }`}
          >
            {tacticalState.inspiration ? '✦ ATIVA' : 'INATIVA'}
          </span>
        </div>

        {/* Gambiarras / Engenhocas de Campo (Slots Rápidos) */}
        <div className="p-4 rounded-3xl bg-[#141217] border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-zinc-400 flex items-center space-x-1">
              <Wrench size={10} className="text-red-400" />
              <span>Gambiarras</span>
            </span>
            <span className="text-xs font-mono font-bold text-red-400">
              {tacticalState.gadgetSlots.current}/{tacticalState.gadgetSlots.max}
            </span>
          </div>

          <div className="my-2">
            <div className="flex space-x-1.5 my-1">
              {Array.from({ length: tacticalState.gadgetSlots.max }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2.5 flex-1 rounded-full transition-all ${i < tacticalState.gadgetSlots.current
                    ? 'bg-red-600 shadow-[0_0_8px_rgba(255,0,0,0.8)]'
                    : 'bg-zinc-800'
                    }`}
                />
              ))}
            </div>
            <p className="text-[11px] text-zinc-400">Usos rápidos de engenhocas</p>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => updateGadgetSlots(-1)}
              className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
            >
              <Minus size={14} />
            </button>
            <span className="text-xs font-bold text-white">Gastar / Recuperar</span>
            <button
              type="button"
              onClick={() => updateGadgetSlots(1)}
              className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>


      {/* Munição e Disparos de Armas (Slots Rápidos) */}
      <div className="p-4 rounded-3xl bg-[#141217] border border-white/10 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold text-zinc-400 flex items-center space-x-1">
            <Wrench size={10} className="text-red-400" />
            <span>A Lista Carmesim</span>
          </span>
          <span className="text-xs font-mono font-bold text-red-400">
            {tacticalState.gadgetSlots.current}/{tacticalState.gadgetSlots.max}
          </span>
        </div>

        <div className="my-2">
          <div className="flex space-x-1.5 my-1">
            {Array.from({ length: tacticalState.gadgetSlots.max }).map((_, i) => (
              <div
                key={i}
                className={`h-2.5 flex-1 rounded-full transition-all ${i < tacticalState.gadgetSlots.current
                  ? 'bg-red-600 shadow-[0_0_8px_rgba(255,0,0,0.8)]'
                  : 'bg-zinc-800'
                  }`}
              />
            ))}
          </div>
          <p className="text-[11px] text-zinc-400">Munição e Disparos de Arma</p>
        </div>

        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => updateGadgetSlots(-1)}
            className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
          >
            <Minus size={14} />
          </button>
          <span className="text-xs font-bold text-white">Gastar / Recuperar</span>
          <button
            type="button"
            onClick={() => updateGadgetSlots(1)}
            className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Munição e Disparos de Armas (Slots Rápidos) */}
      <div className="p-4 rounded-3xl bg-[#141217] border border-white/10 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold text-zinc-400 flex items-center space-x-1">
            <Wrench size={10} className="text-red-400" />
            <span>Má Notícia</span>
          </span>
          <span className="text-xs font-mono font-bold text-red-400">
            {tacticalState.gadgetSlots.current}/{tacticalState.gadgetSlots.max}
          </span>
        </div>

        <div className="my-2">
          <div className="flex space-x-1.5 my-1">
            {Array.from({ length: tacticalState.gadgetSlots.max }).map((_, i) => (
              <div
                key={i}
                className={`h-2.5 flex-1 rounded-full transition-all ${i < tacticalState.gadgetSlots.current
                  ? 'bg-red-600 shadow-[0_0_8px_rgba(255,0,0,0.8)]'
                  : 'bg-zinc-800'
                  }`}
              />
            ))}
          </div>
          <p className="text-[11px] text-zinc-400">Munição e Disparos de Arma</p>
        </div>

        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => updateGadgetSlots(-1)}
            className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
          >
            <Minus size={14} />
          </button>
          <span className="text-xs font-bold text-white">Gastar / Recuperar</span>
          <button
            type="button"
            onClick={() => updateGadgetSlots(1)}
            className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Infusões Sintonizadas do Artífice */}
      <div className="p-4 rounded-3xl bg-[#141217] border border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-red-950/60 text-red-400 border border-red-700/40">
            <Zap size={20} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Infusões Mecânicas Ativas
            </h4>
            <p className="text-[11px] text-zinc-400">
              Itens arcanos sintonizados simultaneamente
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => updateInfusions(-1)}
            className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center font-bold"
          >
            -
          </button>
          <span className="text-base font-black text-white w-8 text-center" style={{ fontFamily: "'Cinzel', serif" }}>
            {tacticalState.infusionsActive.current}/{tacticalState.infusionsActive.max}
          </span>
          <button
            type="button"
            onClick={() => updateInfusions(1)}
            className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center font-bold"
          >
            +
          </button>
        </div>
      </div>

      {/* 2. RASTREADOR DE CONDIÇÕES OFICIAIS */}
      <div className="rounded-3xl bg-[#141217] border border-white/10 p-4 space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold tracking-widest text-zinc-300 uppercase flex items-center space-x-1.5">
            <AlertOctagon size={14} className="text-red-500" />
            <span>Rastreador de Condições</span>
          </h3>
          <span className="text-[10px] text-zinc-500">
            {tacticalState.activeConditions.length} ativas
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {allConditions.map((cond) => {
            const isActive = tacticalState.activeConditions.includes(cond.id)

            return (
              <div
                key={cond.id}
                onClick={() => toggleCondition(cond.id)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start justify-between ${isActive
                  ? 'bg-red-950/60 border-red-600/80 shadow-[0_0_15px_rgba(255,0,0,0.35)]'
                  : 'bg-black/40 border-white/5 hover:border-white/20'
                  }`}
              >
                <div>
                  <span
                    className={`text-xs font-bold block ${isActive ? 'text-red-300' : 'text-zinc-300'
                      }`}
                  >
                    {cond.name}
                  </span>
                  <p className="text-[10px] text-zinc-500 mt-0.5 leading-relaxed">
                    {cond.desc}
                  </p>
                </div>

                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ml-2 mt-0.5 ${isActive
                    ? 'border-red-500 bg-red-600 text-white shadow-[0_0_6px_rgba(255,0,0,0.9)]'
                    : 'border-zinc-700 bg-black'
                    }`}
                >
                  {isActive && <CheckCircle2 size={11} strokeWidth={3} />}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Resumo da Sessão */}
      <div className="p-4 rounded-3xl bg-black/40 border border-white/5 text-center text-xs text-zinc-500">
        <p className="flex items-center justify-center space-x-1.5">
          <Sparkles size={12} className="text-red-500" />
          <span>Status tático sincronizado com a ficha do Santuário</span>
        </p>
      </div>
    </div >
  )
}

export default TacticalView
