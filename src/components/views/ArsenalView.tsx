import { useState, type FC } from 'react'
import {
  Crosshair,
  Sparkles,
  Zap,
  Target,
  Dices,
  Flame,
  Sword,
  Wrench,
  Radio,
  List,
  Eye,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react'
import type { TacticalWeapon, RollRequest, DicePoolItem } from '../../types/character'

interface ArsenalViewProps {
  weapons: TacticalWeapon[]
  onTriggerRoll: (request: RollRequest) => void
}

export const ArsenalView: FC<ArsenalViewProps> = ({ weapons, onTriggerRoll }) => {
  const [viewMode, setViewMode] = useState<'showroom' | 'table'>('showroom')
  const [selectedWeaponIndex, setSelectedWeaponIndex] = useState<number>(0)

  const activeWeapon = weapons[selectedWeaponIndex] || weapons[0]

  const getIcon = (type: TacticalWeapon['iconType'], size = 24) => {
    switch (type) {
      case 'pistol':
      case 'rifle':
        return <Crosshair size={size} className="text-red-400" />
      case 'sword':
        return <Sword size={size} className="text-amber-400" />
      case 'gadget':
        return <Wrench size={size} className="text-blue-400" />
      case 'grenade':
        return <Radio size={size} className="text-emerald-400" />
      default:
        return <Target size={size} className="text-red-400" />
    }
  }

  // Parser para converter string de dano (ex: "1d10 + 4", "3d8", "1d8 + 3") em DicePoolItem[]
  const parseDamageDice = (weapon: TacticalWeapon): DicePoolItem[] => {
    if (weapon.damageDice && weapon.damageDice.length > 0) {
      return weapon.damageDice
    }
    const match = weapon.damage.match(/(\d+)?d(\d+)/i)
    if (match) {
      const count = match[1] ? parseInt(match[1]) : 1
      const die = `d${match[2]}` as any
      return [{ die, count }]
    }
    return [{ die: 'd8', count: 1 }]
  }

  // Rolar apenas Ataque
  const handleRollAttack = (weapon: TacticalWeapon) => {
    onTriggerRoll({
      title: `Ataque: ${weapon.name}`,
      dicePool: [{ die: 'd20', count: 1 }],
      modifier: weapon.atkBonus,
      autoRoll: true,
    })
  }

  // Rolar apenas Dano
  const handleRollDamage = (weapon: TacticalWeapon) => {
    const dice = parseDamageDice(weapon)
    onTriggerRoll({
      title: `Dano: ${weapon.name} (${weapon.damage})`,
      dicePool: dice,
      modifier: weapon.dmgBonus,
      autoRoll: true,
    })
  }

  // Rolar Ataque + Dano Simultâneo
  const handleRollCombined = (weapon: TacticalWeapon) => {
    const dmgDice = parseDamageDice(weapon)
    onTriggerRoll({
      title: `Disparo Completo: ${weapon.name} (Ataque + Dano)`,
      dicePool: [{ die: 'd20', count: 1 }, ...dmgDice],
      modifier: weapon.atkBonus + weapon.dmgBonus,
      autoRoll: true,
    })
  }

  const handlePrevWeapon = () => {
    setSelectedWeaponIndex((prev) => (prev === 0 ? weapons.length - 1 : prev - 1))
  }

  const handleNextWeapon = () => {
    setSelectedWeaponIndex((prev) => (prev === weapons.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className="space-y-4 pb-28 animate-in fade-in duration-300">
      {/* Seletor de Modo de Visualização no Topo */}
      <div className="flex items-center justify-between px-1">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block">
            Loadout Tático
          </span>
          <h2 className="text-lg font-black text-white" style={{ fontFamily: "'Cinzel', serif" }}>
            Arsenal do Salazar
          </h2>
        </div>

        {/* Toggle Mostruário / Tabela */}
        <div className="p-1 rounded-2xl bg-[#141217] border border-white/10 flex items-center space-x-1">
          <button
            type="button"
            onClick={() => setViewMode('showroom')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              viewMode === 'showroom'
                ? 'bg-red-600 text-white shadow-[0_0_12px_rgba(255,0,0,0.7)]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Eye size={13} />
            <span>Mostruário</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              viewMode === 'table'
                ? 'bg-red-600 text-white shadow-[0_0_12px_rgba(255,0,0,0.7)]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <List size={13} />
            <span>Consulta Rápida</span>
          </button>
        </div>
      </div>

      {/* MODO 1: MOSTRUÁRIO TÁTICO IMERSIVO (ESTANDE & CARROSSEL) */}
      {viewMode === 'showroom' && (
        <div className="space-y-4">
          {/* Carrossel de Miniaturas ao Fundo / Seleção Dinâmica */}
          <div className="relative">
            <div className="flex items-center justify-between text-xs text-zinc-400 px-1 mb-1.5">
              <span className="font-semibold uppercase tracking-wider text-[10px]">
                Armas Sintonizadas ({weapons.length})
              </span>
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={handlePrevWeapon}
                  className="p-1 rounded-lg bg-zinc-900 border border-white/10 hover:text-white"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  type="button"
                  onClick={handleNextWeapon}
                  className="p-1 rounded-lg bg-zinc-900 border border-white/10 hover:text-white"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Faixa deslizável de miniaturas */}
            <div className="flex space-x-2.5 overflow-x-auto pb-1 scrollbar-none">
              {weapons.map((w, idx) => {
                const isSelected = idx === selectedWeaponIndex
                return (
                  <div
                    key={w.id}
                    onClick={() => setSelectedWeaponIndex(idx)}
                    className={`flex-shrink-0 p-3 rounded-2xl border transition-all cursor-pointer flex items-center space-x-2.5 ${
                      isSelected
                        ? 'bg-red-950/70 border-red-500 shadow-[0_0_15px_rgba(255,0,0,0.4)] scale-102'
                        : 'bg-black/60 border-white/10 hover:border-red-900/40 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-black border border-white/10 flex items-center justify-center">
                      {getIcon(w.iconType, 16)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white truncate max-w-[120px]">{w.name}</h4>
                      <span className="text-[10px] text-zinc-400 font-mono">{w.damage}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Estande de Exposição Principal com Foco de Luz (Spotlight) */}
          <div className="relative rounded-3xl bg-gradient-to-b from-[#1b1522] via-[#121015] to-black border border-red-700/60 p-6 shadow-2xl overflow-hidden text-center">
            {/* Efeito Spotlight Central */}
            <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-gradient-to-b from-red-600/35 via-red-900/15 to-transparent blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-red-600/20 rounded-full blur-2xl" />

            {/* Pedestal Central da Arma */}
            <div className="relative z-10 flex flex-col items-center">
              <span className="px-3 py-1 rounded-full bg-red-950 border border-red-700/50 text-[10px] font-bold text-red-300 uppercase tracking-widest mb-3">
                {activeWeapon.category}
              </span>

              {/* Ícone Iluminado no Pedestal */}
              <div className="relative w-24 h-24 rounded-3xl bg-black border-2 border-red-600 shadow-[0_0_30px_rgba(255,0,0,0.6)] flex items-center justify-center my-2 group">
                <div className="absolute inset-0 rounded-3xl bg-red-600/20 animate-pulse pointer-events-none" />
                {getIcon(activeWeapon.iconType, 44)}
              </div>

              {/* Título & Alcance */}
              <h3
                className="text-2xl font-black text-white mt-3 tracking-wide"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                {activeWeapon.name}
              </h3>
              <p className="text-xs text-zinc-400 mt-1 font-mono">
                Alcance Operacional: {activeWeapon.range}
              </p>

              {/* Propriedades da Arma */}
              <div className="flex flex-wrap justify-center gap-1.5 my-3">
                {activeWeapon.properties.map((p) => (
                  <span
                    key={p}
                    className="px-2.5 py-0.5 rounded-full bg-black/60 border border-white/10 text-[10px] text-zinc-300 font-medium"
                  >
                    {p}
                  </span>
                ))}
              </div>

              {/* Ficha Técnica: Dano & Bônus */}
              <div className="grid grid-cols-2 gap-3 w-full my-3">
                <div className="p-3 rounded-2xl bg-black/60 border border-white/10 flex flex-col items-center">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 flex items-center space-x-1">
                    <Flame size={12} className="text-red-500" />
                    <span>Dano</span>
                  </span>
                  <div
                    className="text-lg font-black text-white mt-0.5"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    {activeWeapon.damage}
                  </div>
                  <span className="text-[10px] text-zinc-400">{activeWeapon.damageType}</span>
                </div>

                <div className="p-3 rounded-2xl bg-black/60 border border-white/10 flex flex-col items-center">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 flex items-center space-x-1">
                    <Target size={12} className="text-amber-400" />
                    <span>Ataque</span>
                  </span>
                  <div
                    className="text-lg font-black text-amber-400 mt-0.5"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    +{activeWeapon.atkBonus} p/ Acertar
                  </div>
                  <span className="text-[10px] text-zinc-400">Mod: INT (+4) + Prof (+3)</span>
                </div>
              </div>

              {/* Descrição Lore */}
              <p className="text-xs text-zinc-400 leading-relaxed bg-black/40 p-3 rounded-2xl border border-white/5 text-left w-full my-1">
                {activeWeapon.description}
              </p>

              {/* Botões de Ação Rápida */}
              <div className="w-full space-y-2 mt-4 pt-3 border-t border-white/10">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleRollAttack(activeWeapon)}
                    className="py-3 px-3 rounded-2xl bg-red-600 hover:bg-red-500 active:scale-98 text-white font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(255,0,0,0.6)] transition-all flex items-center justify-center space-x-1.5"
                  >
                    <Dices size={16} />
                    <span>Rolar Ataque (+{activeWeapon.atkBonus})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRollDamage(activeWeapon)}
                    className="py-3 px-3 rounded-2xl bg-[#2e0e15] hover:bg-[#45121e] border border-red-800/60 active:scale-98 text-red-200 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-1.5"
                  >
                    <Zap size={15} className="text-amber-400" />
                    <span>Rolar Dano ({activeWeapon.damage})</span>
                  </button>
                </div>

                {/* Rolagem Combinada (Ataque + Dano em 1 Clique) */}
                <button
                  type="button"
                  onClick={() => handleRollCombined(activeWeapon)}
                  className="w-full py-2.5 px-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 hover:border-red-600/50 text-zinc-200 font-semibold text-xs tracking-wider transition-all flex items-center justify-center space-x-1.5"
                >
                  <Sparkles size={14} className="text-amber-400" />
                  <span>Rolar Ataque + Dano Simultâneo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODO 2: CONSULTA RÁPIDA (TABELA DENSA DE COMBATE) */}
      {viewMode === 'table' && (
        <div className="rounded-3xl bg-[#141217] border border-white/10 p-4 shadow-xl space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">
            <ShieldAlert size={14} className="text-red-500" />
            <span>Tabela Tática de Armamento</span>
          </div>

          <div className="space-y-2">
            {weapons.map((w) => (
              <div
                key={w.id}
                className="p-3 rounded-2xl bg-black/60 border border-white/5 hover:border-red-700/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-zinc-900 border border-white/10 flex-shrink-0">
                    {getIcon(w.iconType, 18)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{w.name}</h4>
                    <span className="text-[11px] text-zinc-500 font-mono">
                      {w.range} • {w.properties.slice(0, 2).join(', ')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end space-x-3 pt-1 sm:pt-0 border-t sm:border-t-0 border-white/5">
                  <div className="text-left sm:text-right">
                    <span className="text-xs font-bold font-mono text-amber-400 block">
                      +{w.atkBonus} Acerto
                    </span>
                    <span className="text-xs font-bold font-mono text-zinc-300">
                      {w.damage}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => handleRollAttack(w)}
                      className="px-2.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase shadow-[0_0_10px_rgba(255,0,0,0.5)] flex items-center space-x-1"
                    >
                      <Dices size={12} />
                      <span>Atk</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRollDamage(w)}
                      className="px-2.5 py-1.5 rounded-xl bg-[#2e0e15] border border-red-800/60 text-red-200 font-bold text-xs uppercase"
                    >
                      Dano
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ArsenalView
