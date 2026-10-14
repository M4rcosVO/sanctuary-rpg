/**
 * useCharacterStore.ts
 *
 * Hook central que gerencia o estado dos personagens com persistência
 * automática em localStorage e sincronização opcional com Supabase.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import type { Character, CoinType } from '../types/character'
import {
  saveCharactersLocal,
  loadCharactersLocal,
  saveActiveIdLocal,
  loadActiveIdLocal,
  syncCharactersToCloud,
  loadCharactersFromCloud,
} from '../lib/storage'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

export type SyncStatus = 'idle' | 'saving' | 'saved' | 'error' | 'offline'

interface UseCharacterStoreReturn {
  characters: Character[]
  activeCharacter: Character
  selectedCharacterId: string
  syncStatus: SyncStatus
  syncError: string | null
  cloudUserId: string | null

  setCharacters: (chars: Character[]) => void
  setSelectedCharacterId: (id: string) => void
  updateActiveCharacter: (updater: (prev: Character) => Character) => void
  updateCoins: (coins: CoinType[]) => void
  updateInventory: (items: Character['inventory']) => void
  updateTacticalState: (
    updater: (prev: Character['tacticalState']) => Character['tacticalState']
  ) => void
  updateWeapons: (weapons: Character['tacticalWeapons']) => void
  forceSync: () => Promise<void>
}

// Personagem padrão do Salazar Von Ataraxia (fallback se não houver dados salvos)
const DEFAULT_CHARACTERS: Character[] = [
  {
    id: 'salazar-1',
    name: 'Salazar Von Ataraxia',
    concept: 'Scholar / Engineer',
    system: 'dnd5e',
    systemName: 'D&D 5e • Artífice / Engenheiro',
    level: 5,
    race: 'Humano Variante',
    background: 'Erudito (Guild Artisan)',
    alignment: 'Neutro e Bom',
    xp: { current: 6500, next: 14000 },
    hp: { current: 48, max: 48, temp: 0 },
    speed: '9m (30ft)',
    ca: 15,
    initiative: 3,
    proficiency: 3,
    passivePerception: 14,
    profileImageUrl: undefined,
    imageGallery: [],
    attributes: [
      { id: 'for', name: 'Força', short: 'FOR', value: 10, modifier: 0, savingThrowProficient: false },
      { id: 'des', name: 'Destreza', short: 'DES', value: 16, modifier: 3, savingThrowProficient: false },
      { id: 'con', name: 'Constituição', short: 'CON', value: 14, modifier: 2, savingThrowProficient: true },
      { id: 'int', name: 'Inteligência', short: 'INT', value: 18, modifier: 4, savingThrowProficient: true },
      { id: 'sab', name: 'Sabedoria', short: 'SAB', value: 13, modifier: 1, savingThrowProficient: false },
      { id: 'car', name: 'Carisma', short: 'CAR', value: 12, modifier: 1, savingThrowProficient: false },
    ],
    skills: [
      { id: 'sk-acrobacia', name: 'Acrobacia', attributeShort: 'DES', proficiency: 'none' },
      { id: 'sk-animais', name: 'Adestrar Animais', attributeShort: 'SAB', proficiency: 'none' },
      { id: 'sk-arcanismo', name: 'Arcanismo', attributeShort: 'INT', proficiency: 'expertise' },
      { id: 'sk-atletismo', name: 'Atletismo', attributeShort: 'FOR', proficiency: 'none' },
      { id: 'sk-atuacao', name: 'Atuação', attributeShort: 'CAR', proficiency: 'none' },
      { id: 'sk-enganacao', name: 'Enganação', attributeShort: 'CAR', proficiency: 'none' },
      { id: 'sk-historia', name: 'História', attributeShort: 'INT', proficiency: 'proficient' },
      { id: 'sk-intimidacao', name: 'Intimidação', attributeShort: 'CAR', proficiency: 'none' },
      { id: 'sk-intuicao', name: 'Intuição', attributeShort: 'SAB', proficiency: 'proficient' },
      { id: 'sk-investigacao', name: 'Investigação', attributeShort: 'INT', proficiency: 'expertise' },
      { id: 'sk-medicina', name: 'Medicina', attributeShort: 'SAB', proficiency: 'none' },
      { id: 'sk-natureza', name: 'Natureza', attributeShort: 'INT', proficiency: 'proficient' },
      { id: 'sk-percepcao', name: 'Percepção', attributeShort: 'SAB', proficiency: 'proficient' },
      { id: 'sk-persuasao', name: 'Persuasão', attributeShort: 'CAR', proficiency: 'none' },
      { id: 'sk-prestidigitacao', name: 'Prestidigitação', attributeShort: 'DES', proficiency: 'proficient' },
      { id: 'sk-religiao', name: 'Religião', attributeShort: 'INT', proficiency: 'none' },
      { id: 'sk-sobrevivencia', name: 'Sobrevivência', attributeShort: 'SAB', proficiency: 'none' },
      { id: 'sk-furtividade', name: 'Furtividade', attributeShort: 'DES', proficiency: 'none' },
    ],
    languages: ['Comum', 'Anão', 'Élfico', 'Dracônico'],
    proficienciesList: {
      armor: ['Armaduras Leves', 'Armaduras Médias', 'Escudos'],
      weapons: ['Armas Simples', 'Armas Marciais', 'Armas de Fogo'],
      tools: ['Ferramentas de Engenheiro', 'Ferramentas de Ladrão', 'Ferramentas de Funileiro'],
    },
    features: [
      {
        id: 'feat-1',
        title: 'Pronto para a Batalha (Battle Ready)',
        source: 'Engenharia de Combate',
        snippet: 'Usa Inteligência no lugar de Força/Destreza em armas mágicas.',
        description:
          'Ao empunhar uma arma infundida ou mágica, Salazar utiliza seu modificador de Inteligência (+4) para jogadas de ataque e dano em vez de Força ou Destreza. Também ganha proficiência em armas marciais.',
      },
      {
        id: 'feat-2',
        title: 'Infusões de Artífice (Infuse Item)',
        source: 'Artífice Nv. 5',
        snippet: 'Sintoniza até 3 itens com poderes arcanos simultâneos.',
        description:
          'Salazar imbui objetos mundanos com propriedades mágicas superiores durante descansos longos. Exemplos ativos: Foco de Disparo Repetidor, Armadura da Mente Resistente e Tubo de Energia.',
      },
      {
        id: 'feat-3',
        title: 'Autômato Tático Protetor',
        source: 'Constructo Companheiro',
        snippet: 'Autômato auxiliar que defende e causa dano de força.',
        description:
          'Um autômato quadrúpede de ferro e bronze acompanha Salazar. Possui reação para impor desvantagem em ataques contra aliados próximos e pode disparar pulsos de energia concussiva sob comando bônus.',
      },
      {
        id: 'feat-4',
        title: 'Especialista em Ferramentas (Tool Expertise)',
        source: 'Erudito do Santuário',
        snippet: 'Dobra o bônus de proficiência com ferramentas conhecidas.',
        description:
          'O bônus de proficiência de Salazar é dobrado em qualquer teste de habilidade que utilize ferramentas nas quais ele possua proficiência.',
      },
    ],
    tacticalWeapons: [
      {
        id: 'tw-1',
        name: 'Pistola de Chispa Arcana Infundida',
        category: 'Arma de Fogo (Mágica)',
        damage: '1d10 + 4',
        damageType: 'Perfurante / Força',
        range: '18m / 54m',
        properties: ['Mágica', 'Recarga 6', 'Disparo Repetidor', 'Leve'],
        atkBonus: 7,
        dmgBonus: 4,
        iconType: 'pistol',
        damageDice: [{ die: 'd10', count: 1 }],
        description:
          'Pistola artesanal calibrada com cristais ressonantes. Não requer munição mundana, gerando dardos de força autônomos ao puxar o cão.',
        profileImageUrl: undefined,
        imageGallery: [],
      },
      {
        id: 'tw-2',
        name: 'Sabre Eletrocinético a Vapor',
        category: 'Arma Marcial Corpo a Corpo',
        damage: '1d8 + 3',
        damageDice: [{ die: 'd8', count: 1 }],
        damageType: 'Cortante / Elétrico',
        range: '1.5m',
        properties: ['Acuidade', 'Versátil (1d10)', 'Descarga Elétrica'],
        atkBonus: 6,
        dmgBonus: 3,
        iconType: 'sword',
        description:
          'Lâmina curvada forjada em aço temperado com câmara de vapor pressurizado. Causa faíscas azuis a cada impacto.',
        profileImageUrl: undefined,
        imageGallery: [],
      },
      {
        id: 'tw-3',
        name: 'Mosquete de Precisão Repetidor',
        category: 'Arma de Fogo Longa',
        damage: '1d12 + 4',
        damageDice: [{ die: 'd12', count: 1 }],
        damageType: 'Perfurante',
        range: '36m / 108m',
        properties: ['Duas Mãos', 'Mira Telescópica', 'Impacto Crítico'],
        atkBonus: 7,
        dmgBonus: 4,
        iconType: 'rifle',
        description:
          'Rifle de longo alcance construído para alvejar fraquezas estruturais de abominações e blindagens pesadas.',
        profileImageUrl: undefined,
        imageGallery: [],
      },
      {
        id: 'tw-4',
        name: 'Aparato Granular de Choque',
        category: 'Engenhoca Tática de Área',
        damage: '3d8',
        damageDice: [{ die: 'd8', count: 3 }],
        damageType: 'Elétrico',
        range: 'Raio de 4.5m (Arremesso 18m)',
        properties: ['CD 15 Destreza', 'Área de Choque', 'Consumível Tático'],
        atkBonus: 7,
        dmgBonus: 0,
        iconType: 'grenade',
        description:
          'Esfera metálica com alavanca de mercúrio. Ao explodir, libera uma teia de relâmpagos arcanos paralisantes.',
        profileImageUrl: undefined,
        imageGallery: [],
      },
    ],
    inventory: [
      {
        id: 'item-1',
        name: 'Armadura de Couro Batido Reforçada',
        quantity: 1,
        category: 'Equipamento',
        rarity: 'Incomum',
        rarityColor: 'border-emerald-600/60 text-emerald-400 bg-emerald-950/40',
        description: 'CA 12 + DES. Infundida com circuitos de absorção cinética.',
        equipped: true,
      },
      {
        id: 'item-2',
        name: 'Kit de Ferramentas do Engenheiro',
        quantity: 1,
        category: 'Ferramenta',
        rarity: 'Especial',
        rarityColor: 'border-red-600/60 text-red-400 bg-red-950/40',
        description: 'Permite criar engenhocas, reparar mecanismos e sintonizar infusões.',
        equipped: true,
      },
      {
        id: 'item-3',
        name: 'Amuleto das Frequências Ressonantes',
        quantity: 1,
        category: 'Relíquia',
        rarity: 'Raro',
        rarityColor: 'border-blue-600/60 text-blue-400 bg-blue-950/40',
        description: 'Concede +1 nas jogadas de salvaguarda e permite emitir pulso sônico.',
        equipped: true,
      },
      {
        id: 'item-4',
        name: 'Frascos de Éter Alquímico Volátil',
        quantity: 4,
        category: 'Componente',
        rarity: 'Comum',
        rarityColor: 'border-zinc-700 text-zinc-400 bg-zinc-900/40',
        description: 'Combustível para aparatos mecânicos e granadas táticas.',
        equipped: false,
      },
      {
        id: 'item-5',
        name: 'Poção de Cura Maior',
        quantity: 2,
        category: 'Consumível',
        rarity: 'Incomum',
        rarityColor: 'border-emerald-600/60 text-emerald-400 bg-emerald-950/40',
        description: 'Restaura 4d4 + 4 pontos de vida quando ingerida.',
        equipped: false,
      },
    ],
    coins: [
      { id: 'c-pl', name: 'Platina', symbol: 'PL', amount: 8 },
      { id: 'c-po', name: 'Ouro', symbol: 'PO', amount: 184 },
      { id: 'c-pp', name: 'Prata', symbol: 'PP', amount: 45 },
      { id: 'c-pc', name: 'Cobre', symbol: 'PC', amount: 32 },
    ],
    notes:
      'Salazar é o arquiteto chefe e erudito de engenhocas do Santuário. Carrega relatórios de campo, matrizes arcanas e esquemas de autômatos de defesa contra as ameaças do reino.',
    tacticalState: {
      inspiration: true,
      gadgetSlots: { current: 4, max: 4 },
      infusionsActive: { current: 3, max: 3 },
      activeConditions: [],
    },
  },
]

export function useCharacterStore(): UseCharacterStoreReturn {
  // Carrega personagens: localStorage tem prioridade para resposta imediata
  const [characters, setCharactersState] = useState<Character[]>(() => {
    const local = loadCharactersLocal()
    return local && local.length > 0 ? local : DEFAULT_CHARACTERS
  })

  const [selectedCharacterId, setSelectedCharacterIdState] = useState<string>(() => {
    return loadActiveIdLocal() ?? 'salazar-1'
  })

  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle')
  const [syncError, setSyncError] = useState<string | null>(null)
  const [cloudUserId, setCloudUserId] = useState<string | null>(null)

  // Ref para debounce de salvamento na nuvem
  const saveDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const statusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ─── Configurar listener do Supabase Auth ─────────────────────────────────
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return

    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setCloudUserId(session.user.id)
        // Carregar dados da nuvem ao iniciar
        loadCharactersFromCloud(session.user.id).then(({ data }) => {
          if (data && data.length > 0) {
            setCharactersState(data)
            saveCharactersLocal(data) // atualiza cache local
          }
        })
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCloudUserId(session?.user?.id ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // ─── Persistência com debounce ────────────────────────────────────────────
  const persistCharacters = useCallback(
    (newChars: Character[]) => {
      // 1. Salvar local imediatamente
      saveCharactersLocal(newChars)

      // 2. Sincronizar na nuvem com debounce de 1.5s
      if (saveDebounceRef.current) clearTimeout(saveDebounceRef.current)
      if (statusTimeoutRef.current) clearTimeout(statusTimeoutRef.current)

      if (isSupabaseConfigured && cloudUserId) {
        setSyncStatus('saving')
        saveDebounceRef.current = setTimeout(async () => {
          const { error } = await syncCharactersToCloud(cloudUserId, newChars)
          if (error) {
            setSyncStatus('error')
            setSyncError(error)
          } else {
            setSyncStatus('saved')
            setSyncError(null)
          }
          // Volta para 'idle' após 3s
          statusTimeoutRef.current = setTimeout(() => setSyncStatus('idle'), 3000)
        }, 1500)
      } else {
        // localStorage apenas — feedback imediato
        setSyncStatus('saved')
        statusTimeoutRef.current = setTimeout(() => setSyncStatus('idle'), 2000)
      }
    },
    [cloudUserId]
  )

  const setCharacters = useCallback(
    (chars: Character[]) => {
      setCharactersState(chars)
      persistCharacters(chars)
    },
    [persistCharacters]
  )

  const setSelectedCharacterId = useCallback((id: string) => {
    setSelectedCharacterIdState(id)
    saveActiveIdLocal(id)
  }, [])

  const activeCharacter =
    characters.find((c) => c.id === selectedCharacterId) ?? characters[0]

  const updateActiveCharacter = useCallback(
    (updater: (prev: Character) => Character) => {
      setCharactersState((prevList) => {
        const newList = prevList.map((c) =>
          c.id === activeCharacter.id ? updater(c) : c
        )
        persistCharacters(newList)
        return newList
      })
    },
    [activeCharacter.id, persistCharacters]
  )

  const updateCoins = useCallback(
    (coins: CoinType[]) => {
      updateActiveCharacter((prev) => ({ ...prev, coins }))
    },
    [updateActiveCharacter]
  )

  const updateInventory = useCallback(
    (items: Character['inventory']) => {
      updateActiveCharacter((prev) => ({ ...prev, inventory: items }))
    },
    [updateActiveCharacter]
  )

  const updateTacticalState = useCallback(
    (updater: (prev: Character['tacticalState']) => Character['tacticalState']) => {
      updateActiveCharacter((prev) => ({
        ...prev,
        tacticalState: updater(prev.tacticalState),
      }))
    },
    [updateActiveCharacter]
  )

  const updateWeapons = useCallback(
    (weapons: Character['tacticalWeapons']) => {
      updateActiveCharacter((prev) => ({ ...prev, tacticalWeapons: weapons }))
    },
    [updateActiveCharacter]
  )

  const forceSync = useCallback(async () => {
    if (!isSupabaseConfigured || !cloudUserId) return
    setSyncStatus('saving')
    const { error } = await syncCharactersToCloud(cloudUserId, characters)
    if (error) {
      setSyncStatus('error')
      setSyncError(error)
    } else {
      setSyncStatus('saved')
      setSyncError(null)
      setTimeout(() => setSyncStatus('idle'), 3000)
    }
  }, [cloudUserId, characters])

  return {
    characters,
    activeCharacter,
    selectedCharacterId,
    syncStatus,
    syncError,
    cloudUserId,
    setCharacters,
    setSelectedCharacterId,
    updateActiveCharacter,
    updateCoins,
    updateInventory,
    updateTacticalState,
    updateWeapons,
    forceSync,
  }
}
