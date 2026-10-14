import { useState, type FC, type ChangeEvent } from 'react'
import {
  Shield,
  Heart,
  Zap,
  Flame,
  Swords,
  Award,
  Edit3,
  Check,
  Eye,
  Languages,
  Wrench,
  Dices,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BookOpen,
  User,
} from 'lucide-react'
import type { Character, RollRequest, SkillProficiency } from '../../types/character'
import { ImageGallery } from '../ImageGallery'

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
  const [openFeatures, setOpenFeatures] = useState<Record<string, boolean>>({
    'feat-1': true,
    'feat-2': false,
    'feat-3': false,
  })

  const toggleFeature = (id: string) => {
    setOpenFeatures((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  // Atualizar campo simples do personagem
  const handleFieldChange = (field: keyof Character, value: any) => {
    onUpdateCharacter((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Atualizar pontos de vida
  const handleHpChange = (field: 'current' | 'max' | 'temp', val: number) => {
    onUpdateCharacter((prev) => ({
      ...prev,
      hp: {
        ...prev.hp,
        [field]: Math.max(0, isNaN(val) ? 0 : val),
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

  // Alternar proficiência em salvaguarda
  const handleToggleSavingThrow = (attrId: string) => {
    onUpdateCharacter((prev) => ({
      ...prev,
      attributes: prev.attributes.map((a) =>
        a.id === attrId ? { ...a, savingThrowProficient: !a.savingThrowProficient } : a
      ),
    }))
  }

  // Alternar proficiência em perícia: none -> proficient -> expertise -> none
  const handleCycleSkillProficiency = (skillId: string) => {
    onUpdateCharacter((prev) => ({
      ...prev,
      skills: prev.skills.map((s) => {
        if (s.id !== skillId) return s
        const next: SkillProficiency =
          s.proficiency === 'none'
            ? 'proficient'
            : s.proficiency === 'proficient'
            ? 'expertise'
            : 'none'
        return { ...s, proficiency: next }
      }),
    }))
  }

  // Helper para calcular bônus de perícia
  const getSkillModifier = (skill: (typeof character.skills)[0]) => {
    const attr = character.attributes.find((a) => a.short === skill.attributeShort)
    const baseMod = attr ? attr.modifier : 0
    if (skill.proficiency === 'expertise') {
      return baseMod + character.proficiency * 2
    }
    if (skill.proficiency === 'proficient') {
      return baseMod + character.proficiency
    }
    return baseMod
  }

  // Helper para salvaguarda
  const getSavingThrowModifier = (attr: (typeof character.attributes)[0]) => {
    return attr.modifier + (attr.savingThrowProficient ? character.proficiency : 0)
  }

  const hpPercentage = Math.min(
    100,
    Math.max(0, Math.round((character.hp.current / (character.hp.max || 1)) * 100))
  )

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

      {/* 1. CABEÇALHO OFICIAL D&D 5E */}
      <div className="relative rounded-3xl bg-gradient-to-b from-[#1c1822] to-[#121015] border border-white/10 p-5 shadow-2xl overflow-hidden">
        <div className="pointer-events-none absolute -right-10 -top-10 w-48 h-48 rounded-full bg-red-600/20 blur-3xl" />

        <div className="flex items-start space-x-4">
          {/* Avatar com Galeria */}
          <div className="relative flex-shrink-0">
            <ImageGallery
              profileImageUrl={character.profileImageUrl}
              imageGallery={character.imageGallery ?? []}
              placeholderIcon={<User size={32} className="text-zinc-600" />}
              label={character.name}
              thumbSize="w-20 h-20"
              onUpdateProfile={(url) =>
                onUpdateCharacter((prev) => ({ ...prev, profileImageUrl: url }))
              }
              onUpdateGallery={(gallery) =>
                onUpdateCharacter((prev) => ({ ...prev, imageGallery: gallery }))
              }
            />
            {/* Badge de Nível */}
            {isEditing ? (
              <div className="absolute -bottom-2 -right-2 flex items-center bg-red-700 rounded-full px-1.5 py-0.5 shadow-lg">
                <span className="text-[9px] font-bold text-white mr-0.5">Nv.</span>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={character.level}
                  onChange={(e) =>
                    handleFieldChange('level', Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="w-6 text-[10px] font-bold text-white bg-transparent text-center focus:outline-none"
                />
              </div>
            ) : (
              <span className="absolute -bottom-2 -right-2 px-1.5 py-0.5 rounded-full bg-red-700 text-[10px] font-bold text-white shadow-lg">
                Nv. {character.level}
              </span>
            )}
          </div>

          {/* Nome, Classe, Raça, Antecedente, Alinhamento e XP */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={character.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  placeholder="Nome do Personagem"
                  className="w-full bg-black/60 border border-red-900/50 rounded-xl px-2.5 py-1 text-sm font-bold text-white focus:outline-none focus:border-red-500"
                />
                <input
                  type="text"
                  value={character.concept}
                  onChange={(e) => handleFieldChange('concept', e.target.value)}
                  placeholder="Classe & Subclasse"
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-zinc-200"
                />
                <div className="grid grid-cols-2 gap-1.5">
                  <input
                    type="text"
                    value={character.race}
                    onChange={(e) => handleFieldChange('race', e.target.value)}
                    placeholder="Raça"
                    className="bg-black/60 border border-white/10 rounded-xl px-2 py-1 text-[11px] text-zinc-300"
                  />
                  <input
                    type="text"
                    value={character.background}
                    onChange={(e) => handleFieldChange('background', e.target.value)}
                    placeholder="Antecedente"
                    className="bg-black/60 border border-white/10 rounded-xl px-2 py-1 text-[11px] text-zinc-300"
                  />
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded-full bg-red-950 border border-red-700/50 text-[10px] font-bold text-red-300 uppercase tracking-wider">
                    {character.concept}
                  </span>
                </div>
                <h2
                  className="text-xl font-black text-white truncate tracking-wide mt-1"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  {character.name}
                </h2>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-zinc-400 mt-0.5">
                  <span>{character.race}</span>
                  <span>•</span>
                  <span>{character.background}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. ESTATÍSTICAS DE COMBATE: PV, PV Temp, CA, Iniciativa, Deslocamento e Proficiência */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* PV Atual / Max */}
        <div className="col-span-2 p-3.5 rounded-2xl bg-[#151318] border border-white/10 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="flex items-center space-x-1.5 text-red-400 text-xs font-bold">
              <Heart size={14} className="fill-red-500 text-red-500" />
              <span>Pontos de Vida (PV)</span>
            </span>
            {isEditing ? (
              <div className="flex items-center space-x-1 text-xs">
                <input
                  type="number"
                  value={character.hp.current}
                  onChange={(e) => handleHpChange('current', parseInt(e.target.value))}
                  className="w-10 bg-black/70 border border-red-800 rounded px-1 text-center font-bold text-red-400"
                />
                <span>/</span>
                <input
                  type="number"
                  value={character.hp.max}
                  onChange={(e) => handleHpChange('max', parseInt(e.target.value))}
                  className="w-10 bg-black/70 border border-white/20 rounded px-1 text-center font-bold text-zinc-200"
                />
              </div>
            ) : (
              <span className="text-xs font-bold text-zinc-200">
                <span className="text-red-400 text-sm">{character.hp.current}</span> / {character.hp.max}
              </span>
            )}
          </div>

          <div className="h-2 w-full bg-black/60 rounded-full overflow-hidden p-0.5 border border-white/5 my-1">
            <div
              className="h-full bg-gradient-to-r from-red-700 to-red-500 rounded-full shadow-[0_0_10px_rgba(255,0,0,0.8)] transition-all"
              style={{ width: `${hpPercentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-1">
            <span>PV Temporário:</span>
            {isEditing ? (
              <input
                type="number"
                value={character.hp.temp}
                onChange={(e) => handleHpChange('temp', parseInt(e.target.value))}
                className="w-10 bg-black/60 border border-amber-800 rounded px-1 text-center text-amber-300 font-bold"
              />
            ) : (
              <span className="font-bold text-amber-300">{character.hp.temp || 0}</span>
            )}
          </div>
        </div>

        {/* Classe de Armadura (CA) */}
        <div className="p-3 rounded-2xl bg-[#151318] border border-white/10 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] uppercase font-bold text-zinc-400 flex items-center space-x-1">
            <Shield size={12} className="text-red-400" />
            <span>Armadura (CA)</span>
          </span>
          {isEditing ? (
            <input
              type="number"
              value={character.ca}
              onChange={(e) => handleFieldChange('ca', parseInt(e.target.value) || 10)}
              className="w-12 text-center text-xl font-black text-white bg-transparent focus:outline-none"
            />
          ) : (
            <span className="text-2xl font-black text-white mt-0.5" style={{ fontFamily: "'Cinzel', serif" }}>
              {character.ca}
            </span>
          )}
        </div>

        {/* Iniciativa (Click-to-Roll) */}
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
          className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center transition-all ${
            !isEditing
              ? 'bg-[#151318] border-white/10 hover:border-red-600 hover:shadow-[0_0_12px_rgba(255,0,0,0.4)] cursor-pointer active:scale-95'
              : 'bg-[#151318] border-white/10'
          }`}
          title={!isEditing ? 'Clique para rolar Iniciativa' : undefined}
        >
          <span className="text-[10px] uppercase font-bold text-zinc-400 flex items-center space-x-1">
            <Flame size={12} className="text-amber-400" />
            <span>Iniciativa</span>
            {!isEditing && <Dices size={10} className="text-red-400" />}
          </span>
          {isEditing ? (
            <input
              type="number"
              value={character.initiative}
              onChange={(e) => handleFieldChange('initiative', parseInt(e.target.value) || 0)}
              className="w-12 text-center text-xl font-black text-amber-400 bg-transparent focus:outline-none"
            />
          ) : (
            <span className="text-2xl font-black text-amber-400 mt-0.5" style={{ fontFamily: "'Cinzel', serif" }}>
              {character.initiative >= 0 ? `+${character.initiative}` : character.initiative}
            </span>
          )}
        </div>

        {/* Deslocamento */}
        <div className="p-3 rounded-2xl bg-[#151318] border border-white/10 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] uppercase font-bold text-zinc-400 flex items-center space-x-1">
            <Zap size={12} className="text-yellow-400" />
            <span>Deslocamento</span>
          </span>
          {isEditing ? (
            <input
              type="text"
              value={character.speed}
              onChange={(e) => handleFieldChange('speed', e.target.value)}
              className="w-16 text-center text-sm font-bold text-white bg-transparent focus:outline-none"
            />
          ) : (
            <span className="text-lg font-black text-white mt-1" style={{ fontFamily: "'Cinzel', serif" }}>
              {character.speed}
            </span>
          )}
        </div>

        {/* Bônus de Proficiência */}
        <div className="p-3 rounded-2xl bg-[#151318] border border-white/10 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] uppercase font-bold text-zinc-400 flex items-center space-x-1">
            <Award size={12} className="text-red-400" />
            <span>Proficiência</span>
          </span>
          {isEditing ? (
            <input
              type="number"
              value={character.proficiency}
              onChange={(e) => handleFieldChange('proficiency', parseInt(e.target.value) || 2)}
              className="w-12 text-center text-xl font-black text-white bg-transparent focus:outline-none"
            />
          ) : (
            <span className="text-2xl font-black text-white mt-0.5" style={{ fontFamily: "'Cinzel', serif" }}>
              +{character.proficiency}
            </span>
          )}
        </div>
      </div>

      {/* 3. ATRIBUTOS PRINCIPAIS COM CLICK-TO-ROLL */}
      <div>
        <div className="flex items-center justify-between px-1 mb-2">
          <h3 className="text-xs font-bold tracking-widest text-zinc-400 uppercase flex items-center space-x-1.5">
            <Swords size={14} className="text-red-500" />
            <span>Atributos Principais</span>
            {!isEditing && <span className="text-[10px] font-normal text-zinc-500 lowercase">(clique para rolar)</span>}
          </h3>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
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
              className={`p-2.5 rounded-2xl border transition-all flex flex-col items-center justify-center text-center group ${
                isEditing
                  ? 'bg-[#151318] border-white/10'
                  : 'bg-[#151318] border-white/10 hover:border-red-600 hover:shadow-[0_0_15px_rgba(255,0,0,0.4)] cursor-pointer active:scale-95'
              }`}
            >
              <span className="text-[10px] font-bold text-zinc-400 group-hover:text-red-400 transition-colors uppercase">
                {attr.short}
              </span>

              {isEditing ? (
                <div className="my-1">
                  <input
                    type="number"
                    value={attr.value}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleAttributeChange(attr.id, parseInt(e.target.value))
                    }
                    className="w-10 text-center text-base font-black text-white bg-black/60 border border-red-900/40 rounded focus:outline-none"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  />
                  <span className="block text-[9px] text-zinc-500 font-mono">
                    {attr.modifier >= 0 ? `+${attr.modifier}` : attr.modifier}
                  </span>
                </div>
              ) : (
                <>
                  <span className="text-base font-black text-white my-0.5" style={{ fontFamily: "'Cinzel', serif" }}>
                    {attr.value}
                  </span>
                  <span className="px-2 py-0.2 rounded-full bg-red-950 border border-red-800/50 text-[10px] font-bold text-red-300">
                    {attr.modifier >= 0 ? `+${attr.modifier}` : attr.modifier}
                  </span>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 4. SALVAGUARDAS (SAVING THROWS) COM CLICK-TO-ROLL */}
      <div className="rounded-3xl bg-[#141217] border border-white/10 p-4">
        <h3 className="text-xs font-bold tracking-widest text-zinc-300 uppercase mb-3 flex items-center space-x-1.5">
          <Shield size={14} className="text-red-500" />
          <span>Salvaguardas (Saving Throws)</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {character.attributes.map((attr) => {
            const saveMod = getSavingThrowModifier(attr)
            return (
              <div
                key={`save-${attr.id}`}
                onClick={() => {
                  if (isEditing) {
                    handleToggleSavingThrow(attr.id)
                  } else {
                    onTriggerRoll({
                      title: `Salvaguarda de ${attr.name}`,
                      die: 'd20',
                      modifier: saveMod,
                      autoRoll: true,
                    })
                  }
                }}
                className={`p-2.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                  attr.savingThrowProficient
                    ? 'bg-red-950/40 border-red-700/60 shadow-[0_0_10px_rgba(255,0,0,0.2)]'
                    : 'bg-black/40 border-white/5 hover:border-white/20'
                }`}
                title={isEditing ? 'Clique para alternar proficiência' : `Rolar Salvaguarda de ${attr.name}`}
              >
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full border flex items-center justify-center ${
                      attr.savingThrowProficient
                        ? 'border-red-500 bg-red-600 shadow-[0_0_6px_rgba(255,0,0,0.8)]'
                        : 'border-zinc-600 bg-black'
                    }`}
                  />
                  <span className="text-xs font-bold text-zinc-200">{attr.name}</span>
                </div>

                <span
                  className={`text-xs font-bold font-mono ${
                    attr.savingThrowProficient ? 'text-red-400' : 'text-zinc-400'
                  }`}
                >
                  {saveMod >= 0 ? `+${saveMod}` : saveMod}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* 5. AS 18 PERÍCIAS OFICIAIS DE D&D 5E */}
      <div className="rounded-3xl bg-[#141217] border border-white/10 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold tracking-widest text-zinc-300 uppercase flex items-center space-x-1.5">
            <BookOpen size={14} className="text-red-500" />
            <span>Perícias Oficiais (18 Skills)</span>
          </h3>
          <span className="text-[10px] text-zinc-500 font-mono">
            {isEditing ? 'Clique p/ Especialização' : 'Clique p/ Rolar'}
          </span>
        </div>

        <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
          {character.skills.map((skill) => {
            const totalMod = getSkillModifier(skill)

            return (
              <div
                key={skill.id}
                onClick={() => {
                  if (isEditing) {
                    handleCycleSkillProficiency(skill.id)
                  } else {
                    onTriggerRoll({
                      title: `Perícia: ${skill.name} (${skill.attributeShort})`,
                      die: 'd20',
                      modifier: totalMod,
                      autoRoll: true,
                    })
                  }
                }}
                className={`px-3 py-2 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                  skill.proficiency === 'expertise'
                    ? 'bg-amber-950/30 border-amber-600/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                    : skill.proficiency === 'proficient'
                    ? 'bg-red-950/30 border-red-700/50'
                    : 'bg-black/40 border-white/5 hover:border-red-900/40'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  {/* Marcador de Proficiência/Expertise */}
                  <div
                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                      skill.proficiency === 'expertise'
                        ? 'border-amber-400 bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.9)]'
                        : skill.proficiency === 'proficient'
                        ? 'border-red-500 bg-red-600 shadow-[0_0_6px_rgba(255,0,0,0.8)]'
                        : 'border-zinc-700 bg-black'
                    }`}
                  >
                    {skill.proficiency === 'expertise' && <Sparkles size={8} className="text-black" />}
                  </div>

                  <span className="text-xs font-semibold text-zinc-200">{skill.name}</span>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">
                    ({skill.attributeShort})
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {skill.proficiency === 'expertise' && (
                    <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 font-bold border border-amber-700/40">
                      Expertise
                    </span>
                  )}
                  <span
                    className={`text-xs font-bold font-mono ${
                      skill.proficiency === 'expertise'
                        ? 'text-amber-300'
                        : skill.proficiency === 'proficient'
                        ? 'text-red-400'
                        : 'text-zinc-400'
                    }`}
                  >
                    {totalMod >= 0 ? `+${totalMod}` : totalMod}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 6. PERCEPÇÃO PASSIVA, IDIOMAS E PROFICIÊNCIAS */}
      <div className="rounded-3xl bg-[#141217] border border-white/10 p-4 space-y-3.5">
        <h3 className="text-xs font-bold tracking-widest text-zinc-300 uppercase flex items-center space-x-1.5">
          <Eye size={14} className="text-red-500" />
          <span>Percepção Passiva & Proficiências</span>
        </h3>

        {/* Percepção Passiva */}
        <div className="p-3 rounded-2xl bg-black/50 border border-white/5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-zinc-900 border border-white/10 text-red-400">
              <Eye size={18} />
            </div>
            <div>
              <span className="text-xs font-bold text-white">Sabedoria Passiva (Percepção)</span>
              <p className="text-[10px] text-zinc-500">10 + Modificador de Percepção</p>
            </div>
          </div>
          <span className="text-xl font-black text-red-400" style={{ fontFamily: "'Cinzel', serif" }}>
            {character.passivePerception}
          </span>
        </div>

        {/* Idiomas */}
        <div className="p-3 rounded-2xl bg-black/50 border border-white/5">
          <div className="flex items-center space-x-2 text-xs font-bold text-zinc-300 mb-1.5">
            <Languages size={14} className="text-amber-400" />
            <span>Idiomas Conhecidos</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {character.languages.map((lang) => (
              <span
                key={lang}
                className="px-2 py-0.5 rounded-lg bg-zinc-900 border border-white/10 text-[11px] text-zinc-300"
              >
                {lang}
              </span>
            ))}
          </div>
        </div>

        {/* Armas, Armaduras e Ferramentas */}
        <div className="p-3 rounded-2xl bg-black/50 border border-white/5 space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-zinc-300">
            <Wrench size={14} className="text-red-400" />
            <span>Outras Proficiências & Ferramentas</span>
          </div>

          <div className="text-xs text-zinc-400 space-y-1">
            <p>
              <strong className="text-zinc-300">Armaduras:</strong>{' '}
              {character.proficienciesList.armor.join(', ')}
            </p>
            <p>
              <strong className="text-zinc-300">Armas:</strong>{' '}
              {character.proficienciesList.weapons.join(', ')}
            </p>
            <p>
              <strong className="text-zinc-300">Ferramentas:</strong>{' '}
              {character.proficienciesList.tools.join(', ')}
            </p>
          </div>
        </div>
      </div>

      {/* 7. HABILIDADES DE CLASSE (SCHOLAR / ENGINEER) - CAIXAS RETRÁTEIS */}
      <div className="rounded-3xl bg-[#141217] border border-white/10 p-4 space-y-2.5">
        <h3 className="text-xs font-bold tracking-widest text-zinc-300 uppercase flex items-center space-x-1.5 mb-2">
          <Sparkles size={14} className="text-red-500" />
          <span>Habilidades & Características de Classe</span>
        </h3>

        {character.features.map((feat) => {
          const isOpen = !!openFeatures[feat.id]

          return (
            <div
              key={feat.id}
              className="rounded-2xl border border-white/10 bg-black/50 overflow-hidden transition-all"
            >
              <button
                type="button"
                onClick={() => toggleFeature(feat.id)}
                className="w-full p-3 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-white">{feat.title}</span>
                    <span className="text-[10px] px-2 py-0.2 rounded-full bg-red-950/80 border border-red-800/50 text-red-300 font-semibold">
                      {feat.source}
                    </span>
                  </div>
                  {feat.snippet && !isOpen && (
                    <p className="text-[11px] text-zinc-500 truncate mt-0.5 max-w-[280px]">
                      {feat.snippet}
                    </p>
                  )}
                </div>

                <div className="text-zinc-400 p-1">
                  {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </button>

              {isOpen && (
                <div className="px-3.5 pb-3.5 pt-1 text-xs text-zinc-300 border-t border-white/5 leading-relaxed">
                  {feat.description}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default HomeView
