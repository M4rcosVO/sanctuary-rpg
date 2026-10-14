import { useState, type FC, type ChangeEvent } from 'react'
import {
  Shield,
  Heart,
  Zap,
  Flame,
  Swords,
  Skull,
  Award,
  Edit3,
  Check,
  Plus,
  Trash2,
  FileText,
  Dices,
} from 'lucide-react'
import type { Character, RollRequest, AttackItem } from '../../types/character'

interface HomeViewProps {
  character: Character
  onUpdateCharacter: (updater: (prev: Character) => Character) => void
  onTriggerRoll: (request: RollRequest) => void
}

export const HomeView: FC<HomeViewProps> = ({
  character,
  onUpdateCharacter,
  onTriggerRoll,
}) => {
  const [isEditing, setIsEditing] = useState(false)

  // Atualizar campo simples do personagem
  const handleFieldChange = (field: keyof Character, value: any) => {
    onUpdateCharacter((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Atualizar pontos de vida
  const handleHpChange = (field: 'current' | 'max', val: number) => {
    onUpdateCharacter((prev) => ({
      ...prev,
      hp: {
        ...prev.hp,
        [field]: Math.max(0, val),
      },
    }))
  }

  // Atualizar energia / recurso secundário
  const handleEnergyChange = (field: 'current' | 'max' | 'label', val: any) => {
    onUpdateCharacter((prev) => ({
      ...prev,
      energy: {
        ...prev.energy,
        [field]: field === 'label' ? val : Math.max(0, Number(val)),
      },
    }))
  }

  // Atualizar valor de um atributo e recalcular modificador d20 padrão: Math.floor((val - 10) / 2)
  const handleAttributeChange = (attrId: string, rawVal: number) => {
    const val = isNaN(rawVal) ? 10 : rawVal
    const mod = Math.floor((val - 10) / 2)

    onUpdateCharacter((prev) => ({
      ...prev,
      attributes: prev.attributes.map((a) =>
        a.id === attrId
          ? {
              ...a,
              value: val,
              modifier: mod,
            }
          : a
      ),
    }))
  }

  // Adicionar novo ataque
  const handleAddAttack = () => {
    const newAtk: AttackItem = {
      id: Math.random().toString(),
      name: 'Novo Ataque / Habilidade',
      bonus: '+5',
      modNum: 5,
      damage: '1d8 + 3',
      type: 'Físico',
    }
    onUpdateCharacter((prev) => ({
      ...prev,
      attacks: [...prev.attacks, newAtk],
    }))
  }

  // Remover ataque
  const handleRemoveAttack = (atkId: string) => {
    onUpdateCharacter((prev) => ({
      ...prev,
      attacks: prev.attacks.filter((a) => a.id !== atkId),
    }))
  }

  // Atualizar item de ataque
  const handleAttackChange = (atkId: string, field: keyof AttackItem, val: any) => {
    onUpdateCharacter((prev) => ({
      ...prev,
      attacks: prev.attacks.map((a) => {
        if (a.id !== atkId) return a
        const updated = { ...a, [field]: val }
        if (field === 'bonus') {
          const parsedMod = parseInt(val.replace('+', ''), 10)
          updated.modNum = isNaN(parsedMod) ? 0 : parsedMod
        }
        return updated
      }),
    }))
  }

  const hpPercentage = Math.min(100, Math.max(0, Math.round((character.hp.current / (character.hp.max || 1)) * 100)))
  const energyPercentage = Math.min(100, Math.max(0, Math.round((character.energy.current / (character.energy.max || 1)) * 100)))

  return (
    <div className="space-y-5 pb-28 animate-in fade-in duration-300">
      {/* Barra de Controle do Modo de Edição */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse shadow-[0_0_8px_rgba(255,0,0,0.8)]" />
          <span className="text-xs font-bold text-zinc-300 tracking-wider uppercase">
            {character.systemName}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-200 border ${
            isEditing
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.7)]'
              : 'bg-zinc-900/90 text-zinc-300 hover:text-white border-white/10 hover:border-red-600/50'
          }`}
        >
          {isEditing ? (
            <>
              <Check size={14} />
              <span>Salvar Ficha</span>
            </>
          ) : (
            <>
              <Edit3 size={14} className="text-red-400" />
              <span>Modo Edição</span>
            </>
          )}
        </button>
      </div>

      {/* Card do Personagem Principal */}
      <div className="relative rounded-3xl bg-gradient-to-b from-[#1c1822] to-[#121015] border border-white/10 p-5 shadow-2xl overflow-hidden">
        {/* Glow de fundo */}
        <div className="pointer-events-none absolute -right-10 -top-10 w-48 h-48 rounded-full bg-red-600/20 blur-3xl" />

        <div className="flex items-start space-x-4">
          {/* Avatar com Nível */}
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-black border-2 border-red-700/60 shadow-[0_0_20px_rgba(255,0,0,0.4)] flex-shrink-0 flex items-center justify-center">
            <img
              src="/helm.png"
              alt="Avatar do Personagem"
              className="w-16 h-16 object-contain filter drop-shadow"
            />
            {isEditing ? (
              <div className="absolute bottom-1 right-1 flex items-center bg-red-700 rounded-md px-1">
                <span className="text-[9px] font-bold text-white mr-0.5">Nv.</span>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={character.level}
                  onChange={(e) => handleFieldChange('level', Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-6 text-[10px] font-bold text-white bg-transparent text-center focus:outline-none"
                />
              </div>
            ) : (
              <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-red-700 text-[10px] font-bold text-white">
                Nv. {character.level}
              </span>
            )}
          </div>

          {/* Nome e Conceito / Arquétipo */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="space-y-2">
                <div>
                  <label className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold block">
                    Nome do Personagem
                  </label>
                  <input
                    type="text"
                    value={character.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    className="w-full bg-black/60 border border-red-900/50 rounded-xl px-2.5 py-1 text-sm font-bold text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold block">
                    Conceito / Classe / Trilha
                  </label>
                  <input
                    type="text"
                    value={character.concept}
                    onChange={(e) => handleFieldChange('concept', e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-zinc-200 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
            ) : (
              <div>
                <span className="px-2 py-0.5 rounded-full bg-red-950 border border-red-700/50 text-[10px] font-bold text-red-300 uppercase tracking-wider">
                  {character.concept}
                </span>
                <h2
                  className="text-xl font-black text-white truncate tracking-wide mt-1"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  {character.name}
                </h2>
                <p className="text-xs text-zinc-400 truncate mt-0.5">
                  Ficha ativa no Santuário • Nível {character.level}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Barras de Recursos (Vida & Energia/Vigor) */}
        <div className="mt-5 space-y-3.5">
          {/* Pontos de Vida (HP) */}
          <div>
            <div className="flex justify-between items-center text-xs font-semibold mb-1">
              <span className="flex items-center space-x-1.5 text-red-400">
                <Heart size={14} className="fill-red-500 text-red-500" />
                <span>Pontos de Vida (PV)</span>
              </span>

              {isEditing ? (
                <div className="flex items-center space-x-1 text-xs">
                  <input
                    type="number"
                    value={character.hp.current}
                    onChange={(e) => handleHpChange('current', parseInt(e.target.value) || 0)}
                    className="w-12 bg-black/70 border border-red-800 rounded px-1 text-center font-bold text-red-400 focus:outline-none"
                  />
                  <span>/</span>
                  <input
                    type="number"
                    value={character.hp.max}
                    onChange={(e) => handleHpChange('max', parseInt(e.target.value) || 1)}
                    className="w-12 bg-black/70 border border-white/20 rounded px-1 text-center font-bold text-zinc-200 focus:outline-none"
                  />
                </div>
              ) : (
                <span className="text-zinc-200">
                  <strong className="text-red-400">{character.hp.current}</strong> / {character.hp.max} PV
                </span>
              )}
            </div>

            <div className="h-2.5 w-full bg-black/60 rounded-full overflow-hidden p-0.5 border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-red-700 to-red-500 rounded-full shadow-[0_0_12px_rgba(255,0,0,0.8)] transition-all duration-300"
                style={{ width: `${hpPercentage}%` }}
              />
            </div>
          </div>

          {/* Vigor / Mana / Esforço */}
          <div>
            <div className="flex justify-between items-center text-xs font-semibold mb-1">
              <span className="flex items-center space-x-1.5 text-amber-400">
                <Zap size={14} className="fill-amber-400 text-amber-400" />
                {isEditing ? (
                  <input
                    type="text"
                    value={character.energy.label}
                    onChange={(e) => handleEnergyChange('label', e.target.value)}
                    className="w-24 bg-black/60 border border-white/10 rounded px-1 text-[11px] font-bold text-amber-400"
                  />
                ) : (
                  <span>{character.energy.label}</span>
                )}
              </span>

              {isEditing ? (
                <div className="flex items-center space-x-1 text-xs">
                  <input
                    type="number"
                    value={character.energy.current}
                    onChange={(e) => handleEnergyChange('current', parseInt(e.target.value) || 0)}
                    className="w-12 bg-black/70 border border-amber-800 rounded px-1 text-center font-bold text-amber-400 focus:outline-none"
                  />
                  <span>/</span>
                  <input
                    type="number"
                    value={character.energy.max}
                    onChange={(e) => handleEnergyChange('max', parseInt(e.target.value) || 1)}
                    className="w-12 bg-black/70 border border-white/20 rounded px-1 text-center font-bold text-zinc-200 focus:outline-none"
                  />
                </div>
              ) : (
                <span className="text-zinc-200">
                  <strong className="text-amber-400">{character.energy.current}</strong> / {character.energy.max}
                </span>
              )}
            </div>

            <div className="h-2.5 w-full bg-black/60 rounded-full overflow-hidden p-0.5 border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-amber-600 to-yellow-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.6)] transition-all duration-300"
                style={{ width: `${energyPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Badges de Defesa, Iniciativa e Proficiência */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/10 text-center">
          <div className="p-2 rounded-2xl bg-black/40 border border-white/5">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500">Armadura</span>
            {isEditing ? (
              <input
                type="number"
                value={character.ca}
                onChange={(e) => handleFieldChange('ca', parseInt(e.target.value) || 10)}
                className="w-full bg-transparent text-center text-base font-bold text-white focus:outline-none"
              />
            ) : (
              <div className="text-base font-bold text-white flex items-center justify-center space-x-1 mt-0.5">
                <Shield size={14} className="text-red-400" />
                <span>{character.ca} CA</span>
              </div>
            )}
          </div>

          <div
            onClick={() => {
              if (!isEditing) {
                onTriggerRoll({
                  title: 'Iniciativa',
                  die: 'd20',
                  modifier: character.initiative,
                  autoRoll: true,
                })
              }
            }}
            className={`p-2 rounded-2xl bg-black/40 border border-white/5 transition-all ${
              !isEditing ? 'cursor-pointer hover:border-red-600/40 hover:bg-red-950/20' : ''
            }`}
            title={!isEditing ? 'Clique para rolar Iniciativa' : undefined}
          >
            <span className="text-[10px] uppercase tracking-wider text-zinc-500 flex items-center justify-center space-x-1">
              <span>Iniciativa</span>
              {!isEditing && <Dices size={10} className="text-red-400" />}
            </span>
            {isEditing ? (
              <input
                type="number"
                value={character.initiative}
                onChange={(e) => handleFieldChange('initiative', parseInt(e.target.value) || 0)}
                className="w-full bg-transparent text-center text-base font-bold text-amber-400 focus:outline-none"
              />
            ) : (
              <div className="text-base font-bold text-amber-400 flex items-center justify-center space-x-1 mt-0.5">
                <Flame size={14} />
                <span>{character.initiative >= 0 ? `+${character.initiative}` : character.initiative}</span>
              </div>
            )}
          </div>

          <div className="p-2 rounded-2xl bg-black/40 border border-white/5">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500">Bônus Prof.</span>
            {isEditing ? (
              <input
                type="number"
                value={character.proficiency}
                onChange={(e) => handleFieldChange('proficiency', parseInt(e.target.value) || 2)}
                className="w-full bg-transparent text-center text-base font-bold text-white focus:outline-none"
              />
            ) : (
              <div className="text-base font-bold text-white flex items-center justify-center space-x-1 mt-0.5">
                <Award size={14} className="text-red-400" />
                <span>+{character.proficiency}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid de Atributos com Click-to-Roll Direto */}
      <div>
        <div className="flex items-center justify-between px-1 mb-2">
          <h3 className="text-xs font-bold tracking-widest text-zinc-400 uppercase flex items-center space-x-1.5">
            <Swords size={14} className="text-red-500" />
            <span>Atributos</span>
            {!isEditing && (
              <span className="text-[10px] font-normal text-zinc-500 lowercase">
                (clique para rolar teste)
              </span>
            )}
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {character.attributes.map((attr) => (
            <div
              key={attr.id}
              onClick={() => {
                if (!isEditing) {
                  onTriggerRoll({
                    title: `Teste de ${attr.name}`,
                    die: 'd20',
                    modifier: attr.modifier,
                    autoRoll: true,
                  })
                }
              }}
              className={`p-3 rounded-2xl border transition-all flex flex-col items-center justify-center text-center group ${
                isEditing
                  ? 'bg-[#151318] border-white/10'
                  : 'bg-[#151318] border-white/10 hover:border-red-600 hover:shadow-[0_0_15px_rgba(255,0,0,0.4)] cursor-pointer active:scale-95'
              }`}
            >
              <div className="flex items-center space-x-1">
                <span className="text-[10px] font-bold text-zinc-400 group-hover:text-red-400 transition-colors uppercase">
                  {attr.short}
                </span>
                {!isEditing && <Dices size={11} className="text-zinc-600 group-hover:text-red-400" />}
              </div>

              {isEditing ? (
                <div className="my-1">
                  <input
                    type="number"
                    value={attr.value}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleAttributeChange(attr.id, parseInt(e.target.value))
                    }
                    className="w-12 text-center text-lg font-black text-white bg-black/60 border border-red-900/40 rounded-lg focus:outline-none focus:border-red-500"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  />
                  <span className="block text-[10px] text-zinc-500 font-mono mt-0.5">
                    Mod: {attr.modifier >= 0 ? `+${attr.modifier}` : attr.modifier}
                  </span>
                </div>
              ) : (
                <>
                  <span
                    className="text-lg font-black text-white my-0.5"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    {attr.value}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-red-950/80 border border-red-800/50 text-[10px] font-bold text-red-300">
                    {attr.modifier >= 0 ? `+${attr.modifier}` : attr.modifier}
                  </span>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Ações e Ataques Rápidos com Click-to-Roll */}
      <div className="rounded-3xl bg-[#141217] border border-white/10 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold tracking-widest text-zinc-400 uppercase flex items-center space-x-1.5">
            <Skull size={14} className="text-red-500" />
            <span>Ataques & Ações Prontas</span>
          </h3>

          {isEditing && (
            <button
              type="button"
              onClick={handleAddAttack}
              className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center space-x-1"
            >
              <Plus size={14} />
              <span>Adicionar Ataque</span>
            </button>
          )}
        </div>

        <div className="space-y-2.5">
          {character.attacks.map((atk) => (
            <div
              key={atk.id}
              onClick={() => {
                if (!isEditing) {
                  onTriggerRoll({
                    title: `Ataque: ${atk.name}`,
                    die: 'd20',
                    modifier: atk.modNum,
                    autoRoll: true,
                  })
                }
              }}
              className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                isEditing
                  ? 'bg-black/50 border-white/10 flex-col space-y-2 items-stretch'
                  : 'bg-black/50 border-white/5 hover:border-red-600/50 hover:shadow-[0_0_15px_rgba(255,0,0,0.3)] cursor-pointer group active:scale-98'
              }`}
            >
              {isEditing ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={atk.name}
                      onChange={(e) => handleAttackChange(atk.id, 'name', e.target.value)}
                      placeholder="Nome do Ataque"
                      className="flex-1 bg-black/60 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-white"
                    />
                    <input
                      type="text"
                      value={atk.bonus}
                      onChange={(e) => handleAttackChange(atk.id, 'bonus', e.target.value)}
                      placeholder="+Bônus"
                      className="w-16 bg-black/60 border border-white/10 rounded-xl px-2 py-1 text-xs text-center text-red-400"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveAttack(atk.id)}
                      className="p-1.5 text-zinc-500 hover:text-red-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={atk.damage}
                      onChange={(e) => handleAttackChange(atk.id, 'damage', e.target.value)}
                      placeholder="Dano (ex: 1d8 + 3)"
                      className="flex-1 bg-black/60 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-zinc-300"
                    />
                    <input
                      type="text"
                      value={atk.type}
                      onChange={(e) => handleAttackChange(atk.id, 'type', e.target.value)}
                      placeholder="Tipo (ex: Cortante)"
                      className="w-24 bg-black/60 border border-white/10 rounded-xl px-2 py-1 text-xs text-zinc-400"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-zinc-100 group-hover:text-red-400 transition-colors">
                        {atk.name}
                      </span>
                      <Dices size={13} className="text-zinc-600 group-hover:text-red-400 transition-colors" />
                    </div>
                    <p className="text-xs text-zinc-500">
                      {atk.damage} • {atk.type}
                    </p>
                  </div>

                  <span className="px-3 py-1 rounded-xl bg-red-600 text-white font-bold text-xs shadow-[0_0_10px_rgba(255,0,0,0.5)] group-hover:shadow-[0_0_15px_rgba(255,0,0,0.8)] transition-all">
                    {atk.bonus} Rolar
                  </span>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Notas / Anotações Rápidas */}
      <div className="rounded-3xl bg-[#141217] border border-white/10 p-4">
        <h3 className="text-xs font-bold tracking-widest text-zinc-400 uppercase mb-2 flex items-center space-x-1.5">
          <FileText size={14} className="text-red-500" />
          <span>Anotações da Ficha</span>
        </h3>

        {isEditing ? (
          <textarea
            rows={3}
            value={character.notes}
            onChange={(e) => handleFieldChange('notes', e.target.value)}
            placeholder="Anotações sobre a história, traços ou poderes do personagem..."
            className="w-full bg-black/60 border border-white/10 rounded-2xl p-3 text-xs text-zinc-200 focus:outline-none focus:border-red-500"
          />
        ) : (
          <p className="text-xs text-zinc-400 leading-relaxed bg-black/40 p-3 rounded-2xl border border-white/5">
            {character.notes || 'Nenhuma nota registrada para este aventureiro.'}
          </p>
        )}
      </div>
    </div>
  )
}

export default HomeView
