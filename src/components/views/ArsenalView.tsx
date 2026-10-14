import { useState, useEffect, useRef, useCallback, type FC } from 'react'
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
  ShieldAlert,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import type { TacticalWeapon, RollRequest, DicePoolItem } from '../../types/character'
import { ImageGallery } from '../ImageGallery'

interface ArsenalViewProps {
  weapons: TacticalWeapon[]
  onTriggerRoll: (request: RollRequest) => void
  onUpdateWeapons: (weapons: TacticalWeapon[]) => void
}

// ─── Formulário de arma em branco ─────────────────────────────────────────────
const emptyWeapon = (): Omit<TacticalWeapon, 'id'> => ({
  name: '',
  category: '',
  damage: '1d8',
  damageDice: [{ die: 'd8', count: 1 }],
  damageType: 'Cortante',
  range: '1.5m',
  properties: [],
  atkBonus: 0,
  dmgBonus: 0,
  iconType: 'sword',
  description: '',
  profileImageUrl: undefined,
  imageGallery: [],
})

// ─── Tipos de ícone disponíveis ───────────────────────────────────────────────
const ICON_OPTIONS: { value: TacticalWeapon['iconType']; label: string }[] = [
  { value: 'sword', label: '⚔️ Lâmina' },
  { value: 'pistol', label: '🔫 Pistola' },
  { value: 'rifle', label: '🎯 Rifle' },
  { value: 'gadget', label: '🔧 Engenhoca' },
  { value: 'grenade', label: '💥 Granada' },
]

export const ArsenalView: FC<ArsenalViewProps> = ({ weapons, onTriggerRoll, onUpdateWeapons }) => {
  const [viewMode, setViewMode] = useState<'showroom' | 'table'>('showroom')
  // Índice do card SELECIONADO para o painel de detalhes (não muda com o auto-scroll)
  const [selectedWeaponIndex, setSelectedWeaponIndex] = useState<number>(0)
  // Posição atual do carrossel (pode diferir do selecionado)
  const [carouselOffset, setCarouselOffset] = useState<number>(0)

  // Auto-scroll — para quando usuário seleciona manualmente
  const autoScrollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pauseAutoRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [isPaused, setIsPaused] = useState(false)

  // CRUD
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingWeapon, setEditingWeapon] = useState<TacticalWeapon | null>(null)
  const [formData, setFormData] = useState<Omit<TacticalWeapon, 'id'>>(emptyWeapon())
  const [propertiesInput, setPropertiesInput] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const activeWeapon = weapons[selectedWeaponIndex] ?? weapons[0]

  // ─── Auto-scroll do carrossel ───────────────────────────────────────────────
  const startAutoScroll = useCallback(() => {
    if (autoScrollRef.current) clearInterval(autoScrollRef.current)
    autoScrollRef.current = setInterval(() => {
      setCarouselOffset((prev) => (prev + 1) % Math.max(weapons.length, 1))
    }, 2500)
  }, [weapons.length])

  const pauseAutoScroll = useCallback((resumeAfterMs = 4000) => {
    if (autoScrollRef.current) clearInterval(autoScrollRef.current)
    setIsPaused(true)
    if (pauseAutoRef.current) clearTimeout(pauseAutoRef.current)
    pauseAutoRef.current = setTimeout(() => {
      setIsPaused(false)
      startAutoScroll()
    }, resumeAfterMs)
  }, [startAutoScroll])

  useEffect(() => {
    if (weapons.length > 1 && !isPaused) {
      startAutoScroll()
    }
    return () => {
      if (autoScrollRef.current) clearInterval(autoScrollRef.current)
    }
  }, [weapons.length, isPaused, startAutoScroll])

  // Garantir que o índice selecionado não saia do range se armas forem removidas
  useEffect(() => {
    if (selectedWeaponIndex >= weapons.length && weapons.length > 0) {
      setSelectedWeaponIndex(weapons.length - 1)
    }
  }, [weapons.length, selectedWeaponIndex])

  // ─── Seleção manual de arma ─────────────────────────────────────────────────
  const handleSelectWeapon = (idx: number) => {
    setSelectedWeaponIndex(idx)
    setCarouselOffset(idx)
    pauseAutoScroll(4000)
  }

  const handleCarouselPrev = () => {
    const newOffset = (carouselOffset - 1 + weapons.length) % weapons.length
    setCarouselOffset(newOffset)
    pauseAutoScroll()
  }

  const handleCarouselNext = () => {
    const newOffset = (carouselOffset + 1) % weapons.length
    setCarouselOffset(newOffset)
    pauseAutoScroll()
  }

  // ─── Ícones ─────────────────────────────────────────────────────────────────
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

  // ─── Dice parsing ───────────────────────────────────────────────────────────
  const parseDamageDice = (weapon: TacticalWeapon): DicePoolItem[] => {
    if (weapon.damageDice?.length > 0) return weapon.damageDice
    const match = weapon.damage.match(/(\d+)?d(\d+)/i)
    if (match) {
      const count = match[1] ? parseInt(match[1]) : 1
      const die = `d${match[2]}` as DicePoolItem['die']
      return [{ die, count }]
    }
    return [{ die: 'd8', count: 1 }]
  }

  // ─── Roll handlers ──────────────────────────────────────────────────────────
  const handleRollAttack = (weapon: TacticalWeapon) =>
    onTriggerRoll({
      title: `Ataque: ${weapon.name}`,
      dicePool: [{ die: 'd20', count: 1 }],
      modifier: weapon.atkBonus,
      autoRoll: true,
    })

  const handleRollDamage = (weapon: TacticalWeapon) =>
    onTriggerRoll({
      title: `Dano: ${weapon.name} (${weapon.damage})`,
      dicePool: parseDamageDice(weapon),
      modifier: weapon.dmgBonus,
      autoRoll: true,
    })

  const handleRollCombined = (weapon: TacticalWeapon) =>
    onTriggerRoll({
      title: `Disparo Completo: ${weapon.name}`,
      dicePool: [{ die: 'd20', count: 1 }, ...parseDamageDice(weapon)],
      modifier: weapon.atkBonus + weapon.dmgBonus,
      autoRoll: true,
    })

  // ─── CRUD ───────────────────────────────────────────────────────────────────
  const openNewForm = () => {
    setEditingWeapon(null)
    setFormData(emptyWeapon())
    setPropertiesInput('')
    setIsFormOpen(true)
  }

  const openEditForm = (weapon: TacticalWeapon) => {
    setEditingWeapon(weapon)
    setFormData({ ...weapon })
    setPropertiesInput(weapon.properties.join(', '))
    setIsFormOpen(true)
  }

  const handleFormSave = () => {
    if (!formData.name.trim()) return

    const propsArray = propertiesInput
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean)

    // Re-parse damageDice from damage string
    const match = formData.damage.match(/(\d+)?d(\d+)/i)
    const parsedDice: DicePoolItem[] = match
      ? [{ die: `d${match[2]}` as DicePoolItem['die'], count: match[1] ? parseInt(match[1]) : 1 }]
      : [{ die: 'd8', count: 1 }]

    if (editingWeapon) {
      // Editar existente
      const updated = weapons.map((w) =>
        w.id === editingWeapon.id
          ? { ...w, ...formData, properties: propsArray, damageDice: parsedDice }
          : w
      )
      onUpdateWeapons(updated)
    } else {
      // Criar nova
      const newWeapon: TacticalWeapon = {
        ...formData,
        id: `tw-${Date.now()}`,
        properties: propsArray,
        damageDice: parsedDice,
      }
      onUpdateWeapons([...weapons, newWeapon])
    }

    setIsFormOpen(false)
    setEditingWeapon(null)
  }

  const handleDelete = (id: string) => {
    onUpdateWeapons(weapons.filter((w) => w.id !== id))
    setConfirmDeleteId(null)
    if (selectedWeaponIndex >= weapons.length - 1) {
      setSelectedWeaponIndex(Math.max(0, weapons.length - 2))
    }
  }

  // Calcular quais cards exibir no carrossel (visível: até 3-4 cards em volta do offset)
  const getVisibleCards = () => {
    if (weapons.length === 0) return []
    const visible = []
    const count = Math.min(weapons.length, 8) // máximo 8 cards visíveis
    for (let i = 0; i < count; i++) {
      const idx = (carouselOffset + i) % weapons.length
      visible.push({ weapon: weapons[idx], idx })
    }
    return visible
  }

  // ─── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4 pb-28 animate-in fade-in duration-300">

      {/* Header do Arsenal */}
      <div className="flex items-center justify-between px-1">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block">
            Loadout Tático
          </span>
          <h2 className="text-lg font-black text-white" style={{ fontFamily: "'Cinzel', serif" }}>
            Arsenal do Salazar
          </h2>
        </div>

        <div className="flex items-center gap-2">
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
              <span className="hidden sm:inline">Mostruário</span>
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
              <span className="hidden sm:inline">Consulta</span>
            </button>
          </div>

          {/* Botão Adicionar Arma */}
          <button
            type="button"
            onClick={openNewForm}
            className="p-2 rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-[0_0_12px_rgba(255,0,0,0.6)] transition-all active:scale-95"
            title="Adicionar nova arma"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* ── MODO 1: MOSTRUÁRIO IMERSIVO ──────────────────────────────────────── */}
      {viewMode === 'showroom' && (
        <div className="space-y-4">
          {/* Carrossel */}
          <div className="relative">
            <div className="flex items-center justify-between text-xs text-zinc-400 px-1 mb-2">
              <span className="font-semibold uppercase tracking-wider text-[10px]">
                Armas Sintonizadas ({weapons.length})
                {weapons.length > 1 && !isPaused && (
                  <span className="ml-2 text-red-500/60">● auto</span>
                )}
              </span>
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={handleCarouselPrev}
                  className="p-1.5 rounded-lg bg-zinc-900 border border-white/10 hover:text-white hover:border-white/30 transition-all"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  type="button"
                  onClick={handleCarouselNext}
                  className="p-1.5 rounded-lg bg-zinc-900 border border-white/10 hover:text-white hover:border-white/30 transition-all"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Faixa deslizável de cards */}
            <div className="overflow-hidden">
              <div
                className="flex gap-2.5 transition-transform duration-700 ease-in-out"
                style={{ transform: 'translateX(0)' }}
              >
                {getVisibleCards().map(({ weapon: w, idx }) => {
                  const isSelected = idx === selectedWeaponIndex
                  return (
                    <div
                      key={`${w.id}-${idx}`}
                      onClick={() => handleSelectWeapon(idx)}
                      className={`flex-shrink-0 p-3 rounded-2xl border transition-all cursor-pointer flex items-center space-x-2.5 ${
                        isSelected
                          ? 'bg-red-950/70 border-red-500 shadow-[0_0_15px_rgba(255,0,0,0.4)]'
                          : 'bg-black/60 border-white/10 hover:border-red-900/40 opacity-70 hover:opacity-100'
                      }`}
                    >
                      {/* Thumbnail de imagem ou ícone */}
                      <div className="w-10 h-10 rounded-xl bg-black border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {w.profileImageUrl ? (
                          <img src={w.profileImageUrl} alt={w.name} className="w-full h-full object-cover" />
                        ) : (
                          getIcon(w.iconType, 16)
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate max-w-[100px] sm:max-w-[130px]">
                          {w.name}
                        </h4>
                        <span className="text-[10px] text-zinc-400 font-mono">{w.damage}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Indicadores de posição */}
            {weapons.length > 1 && (
              <div className="flex justify-center gap-1 mt-2">
                {weapons.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectWeapon(idx)}
                    className={`rounded-full transition-all ${
                      idx === selectedWeaponIndex
                        ? 'w-4 h-1.5 bg-red-500'
                        : 'w-1.5 h-1.5 bg-zinc-700 hover:bg-zinc-500'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Estande de Exposição Principal */}
          {activeWeapon && (
            <div className="relative rounded-3xl bg-gradient-to-b from-[#1b1522] via-[#121015] to-black border border-red-700/60 p-5 sm:p-6 shadow-2xl overflow-hidden text-center">
              {/* Efeito Spotlight */}
              <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-gradient-to-b from-red-600/35 via-red-900/15 to-transparent blur-3xl" />
              <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-red-600/20 rounded-full blur-2xl" />

              {/* Botões de editar/excluir */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
                <button
                  type="button"
                  onClick={() => openEditForm(activeWeapon)}
                  className="p-1.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 text-zinc-400 hover:text-white transition-all"
                  title="Editar arma"
                >
                  <Pencil size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(activeWeapon.id)}
                  className="p-1.5 rounded-xl bg-zinc-900/80 hover:bg-red-950 border border-white/10 hover:border-red-800/50 text-zinc-400 hover:text-red-400 transition-all"
                  title="Excluir arma"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              <div className="relative z-10 flex flex-col items-center">
                <span className="px-3 py-1 rounded-full bg-red-950 border border-red-700/50 text-[10px] font-bold text-red-300 uppercase tracking-widest mb-3">
                  {activeWeapon.category}
                </span>

                {/* Imagem ou ícone da arma + Galeria */}
                <div className="relative mb-2">
                  <ImageGallery
                    profileImageUrl={activeWeapon.profileImageUrl}
                    imageGallery={activeWeapon.imageGallery}
                    placeholderIcon={getIcon(activeWeapon.iconType, 44)}
                    label={activeWeapon.name}
                    thumbSize="w-24 h-24"
                    onUpdateProfile={(url) => {
                      const updated = weapons.map((w) =>
                        w.id === activeWeapon.id ? { ...w, profileImageUrl: url } : w
                      )
                      onUpdateWeapons(updated)
                    }}
                    onUpdateGallery={(gallery) => {
                      const updated = weapons.map((w) =>
                        w.id === activeWeapon.id ? { ...w, imageGallery: gallery } : w
                      )
                      onUpdateWeapons(updated)
                    }}
                  />
                  {/* Glow do pedestal */}
                  <div className="absolute inset-0 rounded-2xl bg-red-600/20 animate-pulse pointer-events-none -z-10 blur-sm" />
                </div>

                <h3
                  className="text-xl sm:text-2xl font-black text-white mt-2 tracking-wide px-2"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  {activeWeapon.name}
                </h3>
                <p className="text-xs text-zinc-400 mt-1 font-mono">
                  Alcance: {activeWeapon.range}
                </p>

                {/* Propriedades */}
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

                {/* Ficha Técnica */}
                <div className="grid grid-cols-2 gap-3 w-full my-3">
                  <div className="p-3 rounded-2xl bg-black/60 border border-white/10 flex flex-col items-center">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 flex items-center space-x-1">
                      <Flame size={12} className="text-red-500" />
                      <span>Dano</span>
                    </span>
                    <div className="text-lg font-black text-white mt-0.5" style={{ fontFamily: "'Cinzel', serif" }}>
                      {activeWeapon.damage}
                    </div>
                    <span className="text-[10px] text-zinc-400">{activeWeapon.damageType}</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-black/60 border border-white/10 flex flex-col items-center">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 flex items-center space-x-1">
                      <Target size={12} className="text-amber-400" />
                      <span>Acerto</span>
                    </span>
                    <div className="text-lg font-black text-amber-400 mt-0.5" style={{ fontFamily: "'Cinzel', serif" }}>
                      +{activeWeapon.atkBonus}
                    </div>
                    <span className="text-[10px] text-zinc-400">Bônus de Ataque</span>
                  </div>
                </div>

                {/* Descrição */}
                <p className="text-xs text-zinc-400 leading-relaxed bg-black/40 p-3 rounded-2xl border border-white/5 text-left w-full my-1">
                  {activeWeapon.description}
                </p>

                {/* Botões de Rolagem */}
                <div className="w-full space-y-2 mt-4 pt-3 border-t border-white/10">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleRollAttack(activeWeapon)}
                      className="py-3 px-3 rounded-2xl bg-red-600 hover:bg-red-500 active:scale-95 text-white font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(255,0,0,0.6)] transition-all flex items-center justify-center space-x-1.5"
                    >
                      <Dices size={16} />
                      <span>Ataque (+{activeWeapon.atkBonus})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRollDamage(activeWeapon)}
                      className="py-3 px-3 rounded-2xl bg-[#2e0e15] hover:bg-[#45121e] border border-red-800/60 active:scale-95 text-red-200 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-1.5"
                    >
                      <Zap size={15} className="text-amber-400" />
                      <span>Dano ({activeWeapon.damage})</span>
                    </button>
                  </div>
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
          )}

          {weapons.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-600">
              <Sword size={40} className="mb-3 opacity-40" />
              <p className="text-sm text-center mb-4">Nenhuma arma cadastrada ainda.</p>
              <button
                type="button"
                onClick={openNewForm}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold flex items-center gap-2 transition-all"
              >
                <Plus size={14} />
                Adicionar primeira arma
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── MODO 2: CONSULTA RÁPIDA ──────────────────────────────────────────── */}
      {viewMode === 'table' && (
        <div className="rounded-3xl bg-[#141217] border border-white/10 p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">
              <ShieldAlert size={14} className="text-red-500" />
              <span>Tabela Tática</span>
            </div>
          </div>

          {weapons.length === 0 && (
            <div className="flex flex-col items-center py-8 text-zinc-600 text-sm">
              <p>Nenhuma arma cadastrada.</p>
              <button onClick={openNewForm} className="mt-3 px-3 py-1.5 rounded-xl bg-red-600/20 border border-red-800/40 text-red-400 text-xs font-bold flex items-center gap-1">
                <Plus size={12} /> Adicionar
              </button>
            </div>
          )}

          <div className="space-y-2">
            {weapons.map((w) => (
              <div
                key={w.id}
                className="p-3 rounded-2xl bg-black/60 border border-white/5 hover:border-red-700/50 transition-all"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-white/10 flex-shrink-0 overflow-hidden flex items-center justify-center">
                      {w.profileImageUrl ? (
                        <img src={w.profileImageUrl} alt={w.name} className="w-full h-full object-cover" />
                      ) : (
                        getIcon(w.iconType, 18)
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-white truncate">{w.name}</h4>
                      <span className="text-[11px] text-zinc-500 font-mono">
                        {w.range} • {w.properties.slice(0, 2).join(', ')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="text-right hidden sm:block">
                      <span className="text-xs font-bold font-mono text-amber-400 block">+{w.atkBonus} Acerto</span>
                      <span className="text-xs font-bold font-mono text-zinc-300">{w.damage}</span>
                    </div>

                    <div className="flex items-center space-x-1">
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
                      <button
                        type="button"
                        onClick={() => openEditForm(w)}
                        className="p-1.5 rounded-xl bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white transition-all"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(w.id)}
                        className="p-1.5 rounded-xl bg-zinc-900 border border-white/10 text-zinc-400 hover:text-red-400 transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MODAL DE FORMULÁRIO (Criar/Editar Arma) ───────────────────────────── */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setIsFormOpen(false)} />
          <div className="relative z-10 w-full sm:max-w-lg bg-[#111015] border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] flex flex-col">
            {/* Header do form */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
              <h3 className="text-base font-black text-white" style={{ fontFamily: "'Cinzel', serif" }}>
                {editingWeapon ? 'Editar Arma' : 'Nova Arma'}
              </h3>
              <button type="button" onClick={() => setIsFormOpen(false)} className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all">
                <X size={18} />
              </button>
            </div>

            {/* Conteúdo do form */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {/* Nome */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Nome da Arma *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Ex: Espada Longa de Aço"
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-red-600/50 transition-all"
                />
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Categoria</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
                  placeholder="Ex: Arma Marcial Corpo a Corpo"
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-red-600/50 transition-all"
                />
              </div>

              {/* Dano + Tipo */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Dano</label>
                  <input
                    type="text"
                    value={formData.damage}
                    onChange={(e) => setFormData((p) => ({ ...p, damage: e.target.value }))}
                    placeholder="Ex: 1d8 + 3"
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-red-600/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Tipo de Dano</label>
                  <input
                    type="text"
                    value={formData.damageType}
                    onChange={(e) => setFormData((p) => ({ ...p, damageType: e.target.value }))}
                    placeholder="Ex: Cortante"
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-red-600/50 transition-all"
                  />
                </div>
              </div>

              {/* Bônus de Ataque + Dano */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Bônus de Ataque</label>
                  <input
                    type="number"
                    value={formData.atkBonus}
                    onChange={(e) => setFormData((p) => ({ ...p, atkBonus: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:outline-none focus:border-red-600/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Bônus de Dano</label>
                  <input
                    type="number"
                    value={formData.dmgBonus}
                    onChange={(e) => setFormData((p) => ({ ...p, dmgBonus: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:outline-none focus:border-red-600/50 transition-all"
                  />
                </div>
              </div>

              {/* Alcance */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Alcance</label>
                <input
                  type="text"
                  value={formData.range}
                  onChange={(e) => setFormData((p) => ({ ...p, range: e.target.value }))}
                  placeholder="Ex: 1.5m ou 18m / 54m"
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-red-600/50 transition-all"
                />
              </div>

              {/* Ícone */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Ícone (quando sem imagem)</label>
                <div className="flex flex-wrap gap-2">
                  {ICON_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, iconType: opt.value }))}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                        formData.iconType === opt.value
                          ? 'bg-red-600 border-red-500 text-white'
                          : 'bg-zinc-900 border-white/10 text-zinc-400 hover:border-white/30'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Propriedades */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  Propriedades <span className="text-zinc-600 font-normal">(separe por vírgula)</span>
                </label>
                <input
                  type="text"
                  value={propertiesInput}
                  onChange={(e) => setPropertiesInput(e.target.value)}
                  placeholder="Ex: Versátil (1d10), Acuidade, Leve"
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-red-600/50 transition-all"
                />
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Descrição / Lore</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Descreva a arma, sua origem, aparência e capacidades especiais..."
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-red-600/50 transition-all resize-none"
                />
              </div>

              {/* Galeria de imagens (apenas no formulário de edição ou nova arma depois de salvar) */}
              {editingWeapon && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-2">Galeria de Imagens</label>
                  <ImageGallery
                    profileImageUrl={formData.profileImageUrl}
                    imageGallery={formData.imageGallery ?? []}
                    placeholderIcon={getIcon(formData.iconType, 32)}
                    label={formData.name || 'Arma'}
                    thumbSize="w-16 h-16"
                    onUpdateProfile={(url) => setFormData((p) => ({ ...p, profileImageUrl: url }))}
                    onUpdateGallery={(gallery) => setFormData((p) => ({ ...p, imageGallery: gallery }))}
                  />
                </div>
              )}
            </div>

            {/* Footer do form */}
            <div className="flex items-center gap-3 p-4 border-t border-white/10 flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-300 text-sm font-semibold transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleFormSave}
                disabled={!formData.name.trim()}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,0,0,0.4)] transition-all"
              >
                <Check size={15} />
                {editingWeapon ? 'Salvar Alterações' : 'Criar Arma'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL DE CONFIRMAÇÃO DE EXCLUSÃO ─────────────────────────────────── */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setConfirmDeleteId(null)} />
          <div className="relative z-10 w-full max-w-sm bg-[#111015] border border-red-800/50 rounded-3xl p-6 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-950 border border-red-800/60 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={22} className="text-red-400" />
            </div>
            <h3 className="text-base font-black text-white mb-2">Excluir Arma</h3>
            <p className="text-sm text-zinc-400 mb-5">
              Esta ação não pode ser desfeita. A arma será removida permanentemente do arsenal.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-zinc-300 font-semibold text-sm transition-all hover:bg-zinc-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleDelete(confirmDeleteId)}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-all shadow-[0_0_12px_rgba(255,0,0,0.5)]"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ArsenalView
