import { useState, useEffect, useRef, type FC } from 'react'
import { X, RotateCcw, Dices, Sparkles, ChevronUp, ChevronDown, Flame } from 'lucide-react'
import type { RollRequest } from '../types/character'

export type DieType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100'

interface RollHistoryItem {
  id: string
  title: string
  die: DieType
  result: number
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

export const DiceRollerModal: FC<DiceRollerModalProps> = ({
  isOpen,
  onClose,
  initialRollRequest,
}) => {
  const [selectedDie, setSelectedDie] = useState<DieType>('d20')
  const [modifier, setModifier] = useState<number>(0)
  const [rollTitle, setRollTitle] = useState<string>('Rolagem de Dados')
  const [isRolling, setIsRolling] = useState(false)
  const [currentResult, setCurrentResult] = useState<number | null>(null)
  const [history, setHistory] = useState<RollHistoryItem[]>([])
  const [showCriticalBanner, setShowCriticalBanner] = useState(false)

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const diceList: { type: DieType; max: number; label: string }[] = [
    { type: 'd4', max: 4, label: 'D4' },
    { type: 'd6', max: 6, label: 'D6' },
    { type: 'd8', max: 8, label: 'D8' },
    { type: 'd10', max: 10, label: 'D10' },
    { type: 'd12', max: 12, label: 'D12' },
    { type: 'd20', max: 20, label: 'D20' },
    { type: 'd100', max: 100, label: 'D100' },
  ]

  // Limpar timers ao desmontar ou fechar
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  // Sincronizar requisição inicial recebida por Click-to-Roll
  useEffect(() => {
    if (isOpen && initialRollRequest) {
      setSelectedDie(initialRollRequest.die)
      setModifier(initialRollRequest.modifier)
      setRollTitle(initialRollRequest.title)
      setCurrentResult(null)
      setShowCriticalBanner(false)

      if (initialRollRequest.autoRoll) {
        // Pequeno atraso para a animação do modal abrir suavemente antes de rolar
        const autoTimer = setTimeout(() => {
          triggerDeceleratingRoll(initialRollRequest.die, initialRollRequest.modifier, initialRollRequest.title)
        }, 150)
        return () => clearTimeout(autoTimer)
      }
    } else if (isOpen && !initialRollRequest) {
      setRollTitle('Rolagem de Dados')
    }
  }, [isOpen, initialRollRequest])

  const triggerDeceleratingRoll = (dieType: DieType, mod: number, title: string) => {
    if (isRolling) return
    setIsRolling(true)
    setShowCriticalBanner(false)

    const targetDie = diceList.find((d) => d.type === dieType) || diceList[5]

    // Intervalos crescentes para o efeito desacelerado suave (duração ~2 segundos no total)
    // 40 + 45 + 55 + 70 + 90 + 120 + 160 + 210 + 280 + 380 + 500 = 1950ms (~2s)
    const delays = [40, 45, 55, 70, 90, 120, 160, 210, 280, 380, 500]
    let step = 0

    const runStep = () => {
      if (step < delays.length - 1) {
        // Gera número aleatório temporário durante o giro
        const temp = Math.floor(Math.random() * targetDie.max) + 1
        setCurrentResult(temp)
        step++
        timerRef.current = setTimeout(runStep, delays[step])
      } else {
        // Passo final: resultado definitivo
        const finalRoll = Math.floor(Math.random() * targetDie.max) + 1
        setCurrentResult(finalRoll)
        setIsRolling(false)

        const isCritical = targetDie.type === 'd20' && finalRoll === 20
        const isFumble = targetDie.type === 'd20' && finalRoll === 1

        // Exibe o banner de crítico SOMENTE após o término completo da animação
        if (isCritical || isFumble) {
          setShowCriticalBanner(true)
        }

        const newItem: RollHistoryItem = {
          id: Math.random().toString(),
          title: title || 'Rolagem',
          die: dieType,
          result: finalRoll,
          modifier: mod,
          total: finalRoll + mod,
          isCritical,
          isFumble,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        }

        setHistory((prev) => [newItem, ...prev.slice(0, 9)])
      }
    }

    timerRef.current = setTimeout(runStep, delays[0])
  }

  const handleRollClick = () => {
    triggerDeceleratingRoll(selectedDie, modifier, rollTitle)
  }

  if (!isOpen) return null

  const currentDieObj = diceList.find((d) => d.type === selectedDie)!
  const totalWithMod = currentResult !== null ? currentResult + modifier : null
  const isCrit = selectedDie === 'd20' && currentResult === 20
  const isFumble = selectedDie === 'd20' && currentResult === 1

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md transition-all">
      {/* Background dismissal */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Container */}
      <div className="relative w-full max-w-md bg-[#131116] border-t sm:border border-white/10 sm:rounded-3xl rounded-t-3xl p-6 shadow-2xl shadow-red-950/60 z-10 flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Grab bar for mobile */}
        <div className="w-12 h-1 bg-zinc-700 rounded-full mx-auto mb-4 sm:hidden" />

        {/* Header com Título do Teste */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 rounded-2xl bg-red-950/60 text-red-500 border border-red-800/40 shadow-[0_0_12px_rgba(255,0,0,0.4)]">
              <Dices size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide" style={{ fontFamily: "'Cinzel', serif" }}>
                {rollTitle}
              </h2>
              <p className="text-xs text-zinc-400">Rolador d20 & Testes de Ação</p>
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

        {/* Grid de Escolha do Dado */}
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 my-3.5">
          {diceList.map((die) => (
            <button
              key={die.type}
              type="button"
              disabled={isRolling}
              onClick={() => {
                setSelectedDie(die.type)
                setCurrentResult(null)
                setShowCriticalBanner(false)
              }}
              className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl border transition-all text-xs font-bold disabled:opacity-50 ${
                selectedDie === die.type
                  ? 'bg-red-600 text-white border-red-500 shadow-[0_0_15px_rgba(255,0,0,0.6)] scale-105'
                  : 'bg-black/40 text-zinc-400 border-white/10 hover:border-red-900/60 hover:text-zinc-200'
              }`}
            >
              <span>{die.label}</span>
            </button>
          ))}
        </div>

        {/* Área Central de Animação com Easing Desacelerado */}
        <div className="relative my-2 py-8 px-4 rounded-3xl bg-black/70 border border-white/10 flex flex-col items-center justify-center overflow-hidden min-h-[170px]">
          {/* Efeitos de Iluminação no Fundo */}
          <div
            className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${
              !isRolling && showCriticalBanner && isCrit
                ? 'bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.4)_0%,transparent_75%)] opacity-100'
                : !isRolling && showCriticalBanner && isFumble
                ? 'bg-[radial-gradient(circle_at_center,rgba(220,20,60,0.45)_0%,transparent_75%)] opacity-100'
                : 'bg-[radial-gradient(circle_at_center,rgba(220,20,30,0.25)_0%,transparent_70%)] opacity-80'
            }`}
          />

          <span className="text-[11px] uppercase tracking-widest text-zinc-500 mb-1 font-semibold">
            {currentDieObj.label} {modifier !== 0 && `(${modifier >= 0 ? `+${modifier}` : modifier})`}
          </span>

          {/* Número do Dado com Rotação e Pulso ao Girar */}
          <div className="relative z-10 flex items-center justify-center my-2">
            <div
              className={`text-6xl sm:text-7xl font-black transition-all duration-75 select-none ${
                isRolling
                  ? 'scale-110 text-red-400 rotate-6 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]'
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
              {currentResult !== null ? currentResult : '?'}
            </div>
          </div>

          {/* Total com Modificador */}
          {currentResult !== null && modifier !== 0 && (
            <div className="relative z-10 text-sm font-semibold text-zinc-300 mt-1">
              Total com Modificador: <span className="text-red-400 text-base font-bold">{totalWithMod}</span>
            </div>
          )}

          {/* BANNERS DE CRÍTICO: Exibidos ESTRITAMENTE APÓS o término da animação (!isRolling) */}
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

        {/* Ajuste de Modificador & Botão Rolar */}
        <div className="flex items-center space-x-3 my-3">
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

          {/* Botão de Disparo */}
          <button
            type="button"
            disabled={isRolling}
            onClick={handleRollClick}
            className="flex-1 py-3.5 px-6 rounded-full bg-red-600 hover:bg-red-500 active:scale-98 disabled:opacity-50 text-white font-bold tracking-wider text-sm uppercase shadow-[0_0_20px_rgba(255,0,0,0.8)] hover:shadow-[0_0_30px_rgba(255,0,0,1)] transition-all flex items-center justify-center space-x-2"
          >
            <Dices size={18} className={isRolling ? 'animate-spin' : ''} />
            <span>{isRolling ? 'Rolando (2s)...' : `Rolar ${currentDieObj.label}`}</span>
          </button>
        </div>

        {/* Histórico Recente */}
        {history.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
              <span className="font-semibold uppercase tracking-wider">Histórico de Rolagens</span>
              <button
                type="button"
                onClick={() => setHistory([])}
                className="hover:text-red-400 transition-colors flex items-center space-x-1"
              >
                <RotateCcw size={12} />
                <span>Limpar</span>
              </button>
            </div>

            <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
              {history.map((h) => (
                <div
                  key={h.id}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-xl border text-xs flex flex-col items-center ${
                    h.isCritical
                      ? 'bg-amber-950/40 border-amber-600/50 text-amber-300'
                      : h.isFumble
                      ? 'bg-red-950/60 border-red-700/60 text-red-400'
                      : 'bg-black/50 border-white/10 text-zinc-300'
                  }`}
                >
                  <span className="text-[9px] text-zinc-500 uppercase truncate max-w-[80px]">
                    {h.title}
                  </span>
                  <div className="flex items-baseline space-x-1">
                    <span className="font-mono text-[10px] text-zinc-400">{h.die}</span>
                    <span className="font-bold text-sm">{h.total}</span>
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
