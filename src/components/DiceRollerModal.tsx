import { useState, type FC } from 'react'
import { X, RotateCcw, Dices, Sparkles, ChevronUp, ChevronDown } from 'lucide-react'

interface DiceRollerModalProps {
  isOpen: boolean
  onClose: () => void
}

type DieType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100'

interface RollHistoryItem {
  id: string
  die: DieType
  result: number
  modifier: number
  total: number
  isCritical: boolean
  isFumble: boolean
  timestamp: string
}

export const DiceRollerModal: FC<DiceRollerModalProps> = ({ isOpen, onClose }) => {
  const [selectedDie, setSelectedDie] = useState<DieType>('d20')
  const [modifier, setModifier] = useState<number>(0)
  const [isRolling, setIsRolling] = useState(false)
  const [currentResult, setCurrentResult] = useState<number | null>(null)
  const [history, setHistory] = useState<RollHistoryItem[]>([])

  if (!isOpen) return null

  const diceList: { type: DieType; max: number; label: string }[] = [
    { type: 'd4', max: 4, label: 'D4' },
    { type: 'd6', max: 6, label: 'D6' },
    { type: 'd8', max: 8, label: 'D8' },
    { type: 'd10', max: 10, label: 'D10' },
    { type: 'd12', max: 12, label: 'D12' },
    { type: 'd20', max: 20, label: 'D20' },
    { type: 'd100', max: 100, label: 'D100' },
  ]

  const handleRoll = () => {
    if (isRolling) return
    setIsRolling(true)
    const targetDie = diceList.find((d) => d.type === selectedDie) || diceList[5]

    // Animation frames simulation
    let counter = 0
    const interval = setInterval(() => {
      const tempRoll = Math.floor(Math.random() * targetDie.max) + 1
      setCurrentResult(tempRoll)
      counter++
      if (counter > 8) {
        clearInterval(interval)
        const finalRoll = Math.floor(Math.random() * targetDie.max) + 1
        setCurrentResult(finalRoll)
        setIsRolling(false)

        const isCritical = targetDie.type === 'd20' && finalRoll === 20
        const isFumble = targetDie.type === 'd20' && finalRoll === 1

        const newItem: RollHistoryItem = {
          id: Math.random().toString(),
          die: selectedDie,
          result: finalRoll,
          modifier,
          total: finalRoll + modifier,
          isCritical,
          isFumble,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        }

        setHistory((prev) => [newItem, ...prev.slice(0, 9)])
      }
    }, 50)
  }

  const currentDieObj = diceList.find((d) => d.type === selectedDie)!
  const totalWithMod = currentResult !== null ? currentResult + modifier : null
  const isCrit = selectedDie === 'd20' && currentResult === 20
  const isFumble = selectedDie === 'd20' && currentResult === 1

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md transition-all">
      {/* Background dismissal */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Container */}
      <div className="relative w-full max-w-md bg-[#131116] border-t sm:border border-white/10 sm:rounded-3xl rounded-t-3xl p-6 shadow-2xl shadow-red-950/50 z-10 flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Grab bar for mobile */}
        <div className="w-12 h-1 bg-zinc-700 rounded-full mx-auto mb-4 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-red-950/60 text-red-500 border border-red-800/40 shadow-[0_0_12px_rgba(255,0,0,0.4)]">
              <Dices size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide" style={{ fontFamily: "'Cinzel', serif" }}>
                Rolador de Dados
              </h2>
              <p className="text-xs text-zinc-400">Escolha o dado e teste o seu destino</p>
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

        {/* Die Selection Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 my-4">
          {diceList.map((die) => (
            <button
              key={die.type}
              type="button"
              onClick={() => {
                setSelectedDie(die.type)
                setCurrentResult(null)
              }}
              className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl border transition-all text-xs font-bold ${
                selectedDie === die.type
                  ? 'bg-red-600 text-white border-red-500 shadow-[0_0_15px_rgba(255,0,0,0.6)] scale-105'
                  : 'bg-black/40 text-zinc-400 border-white/10 hover:border-red-900/60 hover:text-zinc-200'
              }`}
            >
              <span>{die.label}</span>
            </button>
          ))}
        </div>

        {/* Big Roll Display Area */}
        <div className="relative my-2 py-8 px-4 rounded-3xl bg-black/60 border border-white/10 flex flex-col items-center justify-center overflow-hidden">
          {/* Radial Red Glow behind result */}
          <div
            className={`pointer-events-none absolute inset-0 transition-opacity duration-300 ${
              isCrit
                ? 'bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.35)_0%,transparent_70%)]'
                : isFumble
                ? 'bg-[radial-gradient(circle_at_center,rgba(220,20,60,0.4)_0%,transparent_70%)]'
                : 'bg-[radial-gradient(circle_at_center,rgba(220,20,30,0.25)_0%,transparent_70%)]'
            }`}
          />

          <span className="text-xs uppercase tracking-widest text-zinc-500 mb-1">
            {currentDieObj.label} {modifier !== 0 && `(${modifier >= 0 ? `+${modifier}` : modifier})`}
          </span>

          <div className="relative z-10 flex items-center justify-center my-2">
            <div
              className={`text-6xl font-black transition-transform duration-100 ${
                isRolling ? 'scale-125 rotate-6 text-red-400' : 'scale-100 text-white'
              } ${isCrit ? 'text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.9)]' : ''} ${
                isFumble ? 'text-red-600 drop-shadow-[0_0_20px_rgba(220,38,38,0.9)]' : ''
              }`}
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              {currentResult !== null ? currentResult : '?'}
            </div>
          </div>

          {currentResult !== null && modifier !== 0 && (
            <div className="text-sm font-semibold text-zinc-300 mt-1">
              Total: <span className="text-red-400 text-base">{totalWithMod}</span>
            </div>
          )}

          {isCrit && (
            <div className="mt-2 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold tracking-wider">
              <Sparkles size={14} />
              <span>ACERTO CRÍTICO!</span>
            </div>
          )}

          {isFumble && (
            <div className="mt-2 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-950 text-red-400 border border-red-700/60 text-xs font-bold tracking-wider">
              <span>FALHA CRÍTICA!</span>
            </div>
          )}
        </div>

        {/* Modifier Adjuster & Roll Button */}
        <div className="flex items-center space-x-3 my-3">
          {/* Modificador */}
          <div className="flex items-center bg-black/50 border border-white/10 rounded-2xl px-3 py-2">
            <span className="text-xs font-medium text-zinc-400 mr-2">Mod:</span>
            <span className="text-sm font-bold text-white w-6 text-center">{modifier >= 0 ? `+${modifier}` : modifier}</span>
            <div className="flex flex-col ml-1">
              <button
                type="button"
                onClick={() => setModifier((m) => m + 1)}
                className="text-zinc-400 hover:text-white p-0.5"
              >
                <ChevronUp size={12} />
              </button>
              <button
                type="button"
                onClick={() => setModifier((m) => m - 1)}
                className="text-zinc-400 hover:text-white p-0.5"
              >
                <ChevronDown size={12} />
              </button>
            </div>
          </div>

          {/* Botão Rolar */}
          <button
            type="button"
            disabled={isRolling}
            onClick={handleRoll}
            className="flex-1 py-3.5 px-6 rounded-full bg-red-600 hover:bg-red-500 active:scale-98 disabled:opacity-50 text-white font-bold tracking-wider text-sm uppercase shadow-[0_0_20px_rgba(255,0,0,0.8)] transition-all flex items-center justify-center space-x-2"
          >
            <Dices size={18} className={isRolling ? 'animate-spin' : ''} />
            <span>{isRolling ? 'Rolando...' : `Rolar ${currentDieObj.label}`}</span>
          </button>
        </div>

        {/* History Area */}
        {history.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
              <span className="font-semibold uppercase tracking-wider">Histórico Recente</span>
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
                  className={`flex-shrink-0 px-2.5 py-1.5 rounded-xl border text-xs flex flex-col items-center ${
                    h.isCritical
                      ? 'bg-amber-950/40 border-amber-600/50 text-amber-300'
                      : h.isFumble
                      ? 'bg-red-950/60 border-red-700/60 text-red-400'
                      : 'bg-black/40 border-white/10 text-zinc-300'
                  }`}
                >
                  <span className="text-[10px] text-zinc-500 font-mono uppercase">{h.die}</span>
                  <span className="font-bold text-sm">{h.total}</span>
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
