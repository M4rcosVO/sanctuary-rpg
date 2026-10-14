import { useState, useEffect, useRef, type FC } from 'react'
import {
  X,
  RotateCcw,
  Dices,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Flame,
  Plus,
  Minus,
  Trash2,
} from 'lucide-react'
import type { RollRequest, DieType } from '../types/character'

interface SingleDieResult {
  die: DieType
  value: number
}

interface RollHistoryItem {
  id: string
  title: string
  formula: string
  individualResults: SingleDieResult[]
  diceSum: number
  modifier: number
  total: number
  isCritical: boolean
  isFumble: boolean
  timestamp: string
}

interface DiceRollerModalProps {
  isOpen: boolean
  onClose: () => void
  initialRollRequest?: RollRequest | null
}

const DIE_MAX: Record<DieType, number> = {
  d4: 4,
  d6: 6,
  d8: 8,
  d10: 10,
  d12: 12,
  d20: 20,
  d100: 100,
}

export const DiceRollerModal: FC<DiceRollerModalProps> = ({
  isOpen,
  onClose,
  initialRollRequest,
}) => {
  // Pool de dados selecionados: mapa de quantidade por tipo de dado
  const [diceCounts, setDiceCounts] = useState<Record<DieType, number>>({
    d4: 0,
    d6: 0,
    d8: 0,
    d10: 0,
    d12: 0,
    d20: 1,
    d100: 0,
  })

  const [modifier, setModifier] = useState<number>(0)
  const [rollTitle, setRollTitle] = useState<string>('Rolador de Dados')
  const [isRolling, setIsRolling] = useState(false)
  const [currentDiceResults, setCurrentDiceResults] = useState<SingleDieResult[] | null>(null)
  const [history, setHistory] = useState<RollHistoryItem[]>([])
  const [showCriticalBanner, setShowCriticalBanner] = useState(false)

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const diceOrder: DieType[] = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100']

  // Limpar timers ao fechar
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  // Sincronizar requisição inicial recebida por Click-to-Roll
  useEffect(() => {
    if (isOpen && initialRollRequest) {
      setRollTitle(initialRollRequest.title || 'Rolagem')
      setModifier(initialRollRequest.modifier || 0)
      setCurrentDiceResults(null)
      setShowCriticalBanner(false)

      const newCounts: Record<DieType, number> = {
        d4: 0,
        d6: 0,
        d8: 0,
        d10: 0,
        d12: 0,
        d20: 0,
        d100: 0,
      }

      if (initialRollRequest.dicePool && initialRollRequest.dicePool.length > 0) {
        initialRollRequest.dicePool.forEach((item) => {
          if (newCounts[item.die] !== undefined) {
            newCounts[item.die] += item.count
          }
        })
      } else if (initialRollRequest.die) {
        newCounts[initialRollRequest.die] = 1
      } else {
        newCounts.d20 = 1
      }

      setDiceCounts(newCounts)

      if (initialRollRequest.autoRoll) {
        const autoTimer = setTimeout(() => {
          triggerDeceleratingRoll(newCounts, initialRollRequest.modifier || 0, initialRollRequest.title)
        }, 120)
        return () => clearTimeout(autoTimer)
      }
    } else if (isOpen && !initialRollRequest) {
      setRollTitle('Rolador de Dados')
    }
  }, [isOpen, initialRollRequest])

  // Ajustar quantidade de um dado no pool
  const updateDieCount = (die: DieType, delta: number) => {
    if (isRolling) return
    setDiceCounts((prev) => {
      const next = Math.max(0, Math.min(10, prev[die] + delta))
      return { ...prev, [die]: next }
    })
    setCurrentDiceResults(null)
    setShowCriticalBanner(false)
  }

  // Limpar pool para 1d20 padrão
  const resetPool = () => {
    if (isRolling) return
    setDiceCounts({
      d4: 0,
      d6: 0,
      d8: 0,
      d10: 0,
      d12: 0,
      d20: 1,
      d100: 0,
    })
    setModifier(0)
    setCurrentDiceResults(null)
    setShowCriticalBanner(false)
  }

  // Montar lista plana de todos os dados do pool
  const getFlatDiceList = (counts: Record<DieType, number>): DieType[] => {
    const list: DieType[] = []
    diceOrder.forEach((d) => {
      const qty = counts[d]
      for (let i = 0; i < qty; i++) {
        list.push(d)
      }
    })
    return list
  }

  // Montar string da fórmula (ex: "2d20 + 1d8 + 4")
  const getFormulaString = (counts: Record<DieType, number>, mod: number): string => {
    const parts: string[] = []
    diceOrder.forEach((d) => {
      if (counts[d] > 0) {
        parts.push(`${counts[d]}${d}`)
      }
    })
    const dicePart = parts.length > 0 ? parts.join(' + ') : 'Nenhum dado'
    if (mod === 0) return dicePart
    return `${dicePart} ${mod >= 0 ? `+ ${mod}` : `- ${Math.abs(mod)}`}`
  }

  // Disparo com animação desacelerada de ~2 segundos
  const triggerDeceleratingRoll = (
    counts: Record<DieType, number>,
    mod: number,
    title: string
  ) => {
    if (isRolling) return

    const flatDice = getFlatDiceList(counts)
    if (flatDice.length === 0) {
      // Se não há dados selecionados, adiciona 1d20 por padrão
      flatDice.push('d20')
      setDiceCounts((prev) => ({ ...prev, d20: 1 }))
    }

    setIsRolling(true)
    setShowCriticalBanner(false)

    // Delays crescentes para desaceleração realista (~2000ms)
    // 40+45+55+70+90+120+160+210+280+380+500 = 1950ms
    const delays = [40, 45, 55, 70, 90, 120, 160, 210, 280, 380, 500]
    let step = 0

    const runStep = () => {
      if (step < delays.length - 1) {
        // Gera valores temporários para todos os dados durante o giro
        const temp = flatDice.map((die) => ({
          die,
          value: Math.floor(Math.random() * DIE_MAX[die]) + 1,
        }))
        setCurrentDiceResults(temp)
        step++
        timerRef.current = setTimeout(runStep, delays[step])
      } else {
        // Passo final: sorteio oficial definitivo
        const finalResults = flatDice.map((die) => ({
          die,
          value: Math.floor(Math.random() * DIE_MAX[die]) + 1,
        }))

        setCurrentDiceResults(finalResults)
        setIsRolling(false)

        // Verificação de acerto/falha crítica em qualquer d20 presente
        const d20Results = finalResults.filter((r) => r.die === 'd20')
        const hasNatural20 = d20Results.some((r) => r.value === 20)
        const hasNatural1 = d20Results.some((r) => r.value === 1) && !hasNatural20

        if (hasNatural20 || hasNatural1) {
          setShowCriticalBanner(true)
        }

        const sum = finalResults.reduce((acc, curr) => acc + curr.value, 0)
        const total = sum + mod

        const historyItem: RollHistoryItem = {
          id: Math.random().toString(),
          title: title || 'Rolagem',
          formula: getFormulaString(counts, mod),
          individualResults: finalResults,
          diceSum: sum,
          modifier: mod,
          total,
          isCritical: hasNatural20,
          isFumble: hasNatural1,
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
        }

        setHistory((prev) => [historyItem, ...prev.slice(0, 14)])
      }
    }

    timerRef.current = setTimeout(runStep, delays[0])
  }

  const handleRollClick = () => {
    triggerDeceleratingRoll(diceCounts, modifier, rollTitle)
  }

  if (!isOpen) return null

  const totalDiceCount = Object.values(diceCounts).reduce((a, b) => a + b, 0)
  const formulaStr = getFormulaString(diceCounts, modifier)

  const finalSum = currentDiceResults
    ? currentDiceResults.reduce((acc, curr) => acc + curr.value, 0)
    : 0
  const finalTotal = currentDiceResults ? finalSum + modifier : null

  const d20s = currentDiceResults?.filter((r) => r.die === 'd20') || []
  const isCrit = d20s.some((r) => r.value === 20)
  const isFumble = d20s.some((r) => r.value === 1) && !isCrit

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md transition-all">
      {/* Background dismissal */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Container */}
      <div className="relative w-full max-w-md bg-[#131116] border-t sm:border border-white/10 sm:rounded-3xl rounded-t-3xl p-5 shadow-2xl shadow-red-950/70 z-10 flex flex-col max-h-[94vh] overflow-y-auto">
        {/* Grab bar para dispositivos móveis */}
        <div className="w-12 h-1 bg-zinc-700 rounded-full mx-auto mb-3 sm:hidden" />

        {/* Header do Rolador com Fórmula Atual */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 rounded-2xl bg-red-950/60 text-red-500 border border-red-800/40 shadow-[0_0_12px_rgba(255,0,0,0.4)]">
              <Dices size={22} />
            </div>
            <div>
              <h2
                className="text-lg font-bold text-white tracking-wide leading-tight truncate max-w-[220px]"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                {rollTitle}
              </h2>
              <span className="text-xs font-mono text-zinc-400 block truncate">
                Fórmula: {formulaStr}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Seletor & Contadores do Pool de Múltiplos Dados */}
        <div className="my-3">
          <div className="flex items-center justify-between mb-1.5 px-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Selecione o Pool de Dados ({totalDiceCount} dados)
            </span>
            <button
              type="button"
              onClick={resetPool}
              className="text-[10px] text-zinc-500 hover:text-red-400 flex items-center space-x-1 transition-colors"
            >
              <RotateCcw size={10} />
              <span>Resetar (1d20)</span>
            </button>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
            {diceOrder.map((die) => {
              const qty = diceCounts[die]
              const isSelected = qty > 0

              return (
                <div
                  key={die}
                  className={`p-1.5 rounded-2xl border transition-all flex flex-col items-center justify-between ${
                    isSelected
                      ? 'bg-red-950/50 border-red-600 shadow-[0_0_12px_rgba(255,0,0,0.3)]'
                      : 'bg-black/50 border-white/10 hover:border-white/20'
                  }`}
                >
                  <button
                    type="button"
                    disabled={isRolling}
                    onClick={() => updateDieCount(die, 1)}
                    className="w-full text-center text-xs font-black uppercase text-white hover:text-red-400 py-0.5"
                  >
                    {die.toUpperCase()}
                  </button>

                  <div className="flex items-center space-x-1 my-1">
                    <button
                      type="button"
                      disabled={isRolling || qty === 0}
                      onClick={() => updateDieCount(die, -1)}
                      className="w-4 h-4 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center text-[10px] disabled:opacity-30"
                    >
                      <Minus size={10} />
                    </button>
                    <span
                      className={`text-xs font-bold w-4 text-center font-mono ${
                        qty > 0 ? 'text-red-400' : 'text-zinc-600'
                      }`}
                    >
                      {qty}
                    </span>
                    <button
                      type="button"
                      disabled={isRolling || qty >= 10}
                      onClick={() => updateDieCount(die, 1)}
                      className="w-4 h-4 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center text-[10px] disabled:opacity-30"
                    >
                      <Plus size={10} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Display Central da Rolagem (Múltiplos Dados com Animação Desacelerada) */}
        <div className="relative my-2 py-6 px-4 rounded-3xl bg-black/75 border border-white/10 flex flex-col items-center justify-center overflow-hidden min-h-[160px]">
          {/* Fundo Iluminado */}
          <div
            className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${
              !isRolling && showCriticalBanner && isCrit
                ? 'bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.4)_0%,transparent_75%)] opacity-100'
                : !isRolling && showCriticalBanner && isFumble
                ? 'bg-[radial-gradient(circle_at_center,rgba(220,20,60,0.45)_0%,transparent_75%)] opacity-100'
                : 'bg-[radial-gradient(circle_at_center,rgba(220,20,30,0.25)_0%,transparent_70%)] opacity-80'
            }`}
          />

          <span className="relative z-10 text-[11px] uppercase tracking-widest text-zinc-400 mb-1 font-semibold">
            {formulaStr}
          </span>

          {/* Resultado Total Principal */}
          <div className="relative z-10 flex items-center justify-center my-1">
            <div
              className={`text-5xl sm:text-6xl font-black transition-all select-none ${
                isRolling
                  ? 'scale-110 text-red-400 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)] rotate-3'
                  : 'scale-100 text-white'
              } ${
                !isRolling && isCrit
                  ? 'text-amber-300 drop-shadow-[0_0_25px_rgba(251,191,36,0.95)]'
                  : ''
              } ${
                !isRolling && isFumble
                  ? 'text-red-600 drop-shadow-[0_0_25px_rgba(220,38,38,0.95)]'
                  : ''
              }`}
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              {finalTotal !== null ? finalTotal : '?'}
            </div>
          </div>

          {/* Dados Individuais Rolados */}
          {currentDiceResults && currentDiceResults.length > 0 && (
            <div className="relative z-10 mt-2 flex flex-wrap items-center justify-center gap-1.5 max-w-full px-2">
              {currentDiceResults.map((r, i) => (
                <span
                  key={i}
                  className={`px-2 py-0.5 rounded-lg border text-xs font-mono font-bold ${
                    r.die === 'd20' && r.value === 20
                      ? 'bg-amber-950 text-amber-300 border-amber-600 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                      : r.die === 'd20' && r.value === 1
                      ? 'bg-red-950 text-red-400 border-red-700 shadow-[0_0_8px_rgba(220,38,38,0.8)]'
                      : 'bg-zinc-900/90 text-zinc-200 border-white/10'
                  }`}
                >
                  <span className="text-[9px] text-zinc-500 uppercase mr-1">{r.die}:</span>
                  {r.value}
                </span>
              ))}

              {modifier !== 0 && (
                <span className="px-2 py-0.5 rounded-lg bg-zinc-900 border border-white/10 text-xs font-mono font-bold text-red-400">
                  Mod: {modifier >= 0 ? `+${modifier}` : modifier}
                </span>
              )}
            </div>
          )}

          {/* Banners de Crítico: Exibidos SOMENTE após o término da animação */}
          {!isRolling && showCriticalBanner && isCrit && (
            <div className="relative z-10 mt-3 inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/50 text-xs font-black tracking-widest uppercase shadow-[0_0_20px_rgba(245,158,11,0.6)] animate-bounce">
              <Sparkles size={15} />
              <span>SUCESSO CRÍTICO! (20 NATURAL)</span>
            </div>
          )}

          {!isRolling && showCriticalBanner && isFumble && (
            <div className="relative z-10 mt-3 inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-full bg-red-950 text-red-400 border border-red-700 text-xs font-black tracking-widest uppercase shadow-[0_0_20px_rgba(220,38,38,0.6)] animate-pulse">
              <Flame size={15} />
              <span>FALHA CRÍTICA! (1 NATURAL)</span>
            </div>
          )}
        </div>

        {/* Ajuste do Modificador & Botão de Rolagem */}
        <div className="flex items-center space-x-3 my-2">
          {/* Modificador */}
          <div className="flex items-center bg-black/50 border border-white/10 rounded-2xl px-3 py-2">
            <span className="text-xs font-medium text-zinc-400 mr-2">Mod:</span>
            <span className="text-sm font-bold text-white w-7 text-center">
              {modifier >= 0 ? `+${modifier}` : modifier}
            </span>
            <div className="flex flex-col ml-1">
              <button
                type="button"
                disabled={isRolling}
                onClick={() => setModifier((m) => m + 1)}
                className="text-zinc-400 hover:text-white p-0.5 disabled:opacity-30"
              >
                <ChevronUp size={12} />
              </button>
              <button
                type="button"
                disabled={isRolling}
                onClick={() => setModifier((m) => m - 1)}
                className="text-zinc-400 hover:text-white p-0.5 disabled:opacity-30"
              >
                <ChevronDown size={12} />
              </button>
            </div>
          </div>

          {/* Botão Principal de Rolar */}
          <button
            type="button"
            disabled={isRolling || totalDiceCount === 0}
            onClick={handleRollClick}
            className="flex-1 py-3.5 px-6 rounded-full bg-red-600 hover:bg-red-500 active:scale-98 disabled:opacity-50 text-white font-bold tracking-wider text-sm uppercase shadow-[0_0_20px_rgba(255,0,0,0.8)] hover:shadow-[0_0_30px_rgba(255,0,0,1)] transition-all flex items-center justify-center space-x-2"
          >
            <Dices size={18} className={isRolling ? 'animate-spin' : ''} />
            <span>{isRolling ? 'Rolando (2s)...' : `Rolar ${formulaStr}`}</span>
          </button>
        </div>

        {/* Histórico Recente de Rolagens com Formatação Aprimorada (Sem Cortes) */}
        {history.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-2 px-1">
              <span className="font-semibold uppercase tracking-wider">Histórico de Rolagens</span>
              <button
                type="button"
                onClick={() => setHistory([])}
                className="hover:text-red-400 transition-colors flex items-center space-x-1"
              >
                <Trash2 size={12} />
                <span>Limpar</span>
              </button>
            </div>

            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {history.map((h) => (
                <div
                  key={h.id}
                  className={`p-2.5 rounded-2xl border transition-all text-xs flex flex-col space-y-1.5 ${
                    h.isCritical
                      ? 'bg-amber-950/30 border-amber-600/50 text-amber-200'
                      : h.isFumble
                      ? 'bg-red-950/40 border-red-700/60 text-red-200'
                      : 'bg-black/50 border-white/10 text-zinc-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-white break-words">{h.title}</span>
                    <span className="text-[10px] text-zinc-500 font-mono flex-shrink-0">
                      {h.timestamp}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex flex-wrap items-center gap-1 break-words">
                      <span className="font-mono text-zinc-400">{h.formula}</span>
                      <span>=</span>
                      <span className="text-zinc-300 font-mono">
                        [{h.individualResults.map((r) => r.value).join(', ')}]
                        {h.modifier !== 0 && (h.modifier >= 0 ? ` + ${h.modifier}` : ` - ${Math.abs(h.modifier)}`)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5 flex-shrink-0">
                      <span className="text-[11px] text-zinc-400">Total:</span>
                      <span
                        className={`text-sm font-black font-mono ${
                          h.isCritical ? 'text-amber-300' : h.isFumble ? 'text-red-400' : 'text-white'
                        }`}
                      >
                        {h.total}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DiceRollerModal
