export type SystemType = 'dnd5e' | 't20' | 'ordem' | 'custom'

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
}

export interface AttackItem {
  id: string
  name: string
  bonus: string
  modNum: number
  damage: string
  type: string
}

export interface Character {
  id: string
  name: string
  concept: string
  system: SystemType
  systemName: string
  level: number
  hp: {
    current: number
    max: number
  }
  energy: {
    current: number
    max: number
    label: string
  }
  ca: number
  initiative: number
  proficiency: number
  attributes: Attribute[]
  attacks: AttackItem[]
  coins: CoinType[]
  notes: string
}

export interface RollRequest {
  title: string
  die: 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100'
  modifier: number
  autoRoll?: boolean
}
