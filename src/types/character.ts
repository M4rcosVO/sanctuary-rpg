export type SystemType = 'dnd5e' | 't20' | 'ordem' | 'custom'

export type DieType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100'

export interface DicePoolItem {
  die: DieType
  count: number
}

export interface CoinType {
  id: string
  name: string
  symbol: string
  amount: number
}

export interface Attribute {
  id: string
  name: string
  short: string
  value: number
  modifier: number
  savingThrowProficient?: boolean
}

export type SkillProficiency = 'none' | 'proficient' | 'expertise'

export interface SkillItem {
  id: string
  name: string
  attributeShort: 'FOR' | 'DES' | 'CON' | 'INT' | 'SAB' | 'CAR'
  proficiency: SkillProficiency
}

export interface ClassFeature {
  id: string
  title: string
  source: string
  description: string
  snippet?: string
}

export interface TacticalWeapon {
  id: string
  name: string
  category: string
  damage: string
  damageDice: DicePoolItem[]
  damageType: string
  range: string
  properties: string[]
  atkBonus: number
  dmgBonus: number
  iconType: 'pistol' | 'rifle' | 'sword' | 'gadget' | 'grenade'
  description: string
  // Galeria de imagens da arma
  profileImageUrl?: string
  imageGallery?: string[]
}

export type ItemCategory = 'Consumível' | 'Equipamento' | 'Ferramenta' | 'Relíquia' | 'Componente'

export interface InventoryItem {
  id: string
  name: string
  quantity: number
  category: ItemCategory
  rarity: 'Comum' | 'Incomum' | 'Raro' | 'Muito Raro' | 'Lendário' | 'Especial'
  rarityColor: string
  description: string
  equipped?: boolean
}

export interface Character {
  id: string
  name: string
  concept: string
  system: SystemType
  systemName: string
  level: number
  race: string
  background: string
  alignment?: string
  xp?: {
    current: number
    next: number
  }
  hp: {
    current: number
    max: number
    temp: number
  }
  speed: string
  ca: number
  initiative: number
  proficiency: number
  passivePerception: number
  attributes: Attribute[]
  skills: SkillItem[]
  languages: string[]
  proficienciesList: {
    armor: string[]
    weapons: string[]
    tools: string[]
  }
  features: ClassFeature[]
  tacticalWeapons: TacticalWeapon[]
  inventory: InventoryItem[]
  coins: CoinType[]
  notes: string
  tacticalState: {
    inspiration: boolean
    gadgetSlots: { current: number; max: number }
    infusionsActive: { current: number; max: number }
    activeConditions: string[]
  }
  // Galeria de imagens do personagem
  profileImageUrl?: string
  imageGallery?: string[]
}

export interface RollRequest {
  title: string
  dicePool?: DicePoolItem[]
  die?: DieType // Suporte legado/retrocompatibilidade
  modifier: number
  autoRoll?: boolean
  detailNotes?: string
}
