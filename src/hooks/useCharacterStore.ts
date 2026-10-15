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
    concept: 'Artesão da Forja de Sangue Infernal',
    system: 'dnd5e',
    systemName: 'D&D 5e • Artesão da Forja de Sangue Infernal',
    level: 3,
    race: 'Humano Variante',
    background: 'Metamorfo',
    alignment: 'Leal e Mal',
    xp: { current: 6500, next: 14000 },
    hp: { current: 27, max: 27, temp: 0 },
    speed: '10m (32ft)',
    ca: 16,
    initiative: 2,
    proficiency: 2,
    passivePerception: 12,
    profileImageUrl: undefined,
    imageGallery: [],
    attributes: [
      { id: 'for', name: 'Força', short: 'FOR', value: 8, modifier: -1, savingThrowProficient: false },
      { id: 'des', name: 'Destreza', short: 'DES', value: 14, modifier: 2, savingThrowProficient: true },
      { id: 'con', name: 'Constituição', short: 'CON', value: 14, modifier: 2, savingThrowProficient: true },
      { id: 'int', name: 'Inteligência', short: 'INT', value: 12, modifier: 1, savingThrowProficient: false },
      { id: 'sab', name: 'Sabedoria', short: 'SAB', value: 10, modifier: 0, savingThrowProficient: false },
      { id: 'car', name: 'Carisma', short: 'CAR', value: 20, modifier: 5, savingThrowProficient: true },
    ],
    skills: [
      { id: 'sk-acrobacia', name: 'Acrobacia', attributeShort: 'DES', proficiency: 'none' },
      { id: 'sk-animais', name: 'Adestrar Animais', attributeShort: 'SAB', proficiency: 'none' },
      { id: 'sk-arcanismo', name: 'Arcanismo', attributeShort: 'INT', proficiency: 'proficient' },
      { id: 'sk-atletismo', name: 'Atletismo', attributeShort: 'FOR', proficiency: 'none' },
      { id: 'sk-atuacao', name: 'Atuação', attributeShort: 'CAR', proficiency: 'none' },
      { id: 'sk-enganacao', name: 'Enganação', attributeShort: 'CAR', proficiency: 'expertise' },
      { id: 'sk-historia', name: 'História', attributeShort: 'INT', proficiency: 'none' },
      { id: 'sk-intimidacao', name: 'Intimidação', attributeShort: 'CAR', proficiency: 'proficient' },
      { id: 'sk-intuicao', name: 'Intuição', attributeShort: 'SAB', proficiency: 'proficient' },
      { id: 'sk-investigacao', name: 'Investigação', attributeShort: 'INT', proficiency: 'proficient' },
      { id: 'sk-medicina', name: 'Medicina', attributeShort: 'SAB', proficiency: 'none' },
      { id: 'sk-natureza', name: 'Natureza', attributeShort: 'INT', proficiency: 'none' },
      { id: 'sk-percepcao', name: 'Percepção', attributeShort: 'SAB', proficiency: 'proficient' },
      { id: 'sk-persuasao', name: 'Persuasão', attributeShort: 'CAR', proficiency: 'proficient' },
      { id: 'sk-prestidigitacao', name: 'Prestidigitação', attributeShort: 'DES', proficiency: 'expertise' },
      { id: 'sk-religiao', name: 'Religião', attributeShort: 'INT', proficiency: 'none' },
      { id: 'sk-sobrevivencia', name: 'Sobrevivência', attributeShort: 'SAB', proficiency: 'none' },
      { id: 'sk-furtividade', name: 'Furtividade', attributeShort: 'DES', proficiency: 'expertise' },
    ],
    languages: ['Comum', 'Anão', 'Élfico', 'Dracônico', 'Infernal'],
    proficienciesList: {
      armor: ['Armaduras Leves', 'Armaduras Médias', 'Escudos'],
      weapons: ['Armas Simples', 'Armas de Fogo', 'Armas Rúnicas', 'Armas Exóticas'],
      tools: ['Ferramentas de Engenheiro', 'Ferramentas de Ladrão', 'Ferramentas de Funileiro', 'Ferramentas de Alquimista', 'Ferramentas de Ferreiro', 'Kit de Falsificação']
    },
    features: [
      {
        id: 'feat-1',
        title: 'Ataque Furtivo',
        source: 'Ladino 1 · Oficial',
        snippet: 'Causa +1d6 de dano se tiver vantagem ou se um aliado estiver a até 1,5 m do alvo.',
        description:
          'Ao acertar um ataque com uma arma à distância ou uma arma com Acuidade, causa 1d6 de dano adicional se tiver vantagem no ataque, ou se um inimigo do alvo estiver a até 1,5 m dele e você não tiver desvantagem.',
      },
      {
        id: 'feat-2',
        title: 'Especialização',
        source: 'Ladino 1 · Oficial',
        snippet: 'Dobra o bônus de proficiência.',
        description:
          'Dobra o bônus de proficiência em testes de perícia nos quais seja proficiente.',
      },
      {
        id: 'feat-3',
        title: 'Gíria de Ladrão',
        source: 'Ladino 1 · Oficial',
        snippet: 'Conhece um código secreto de palavras.',
        description:
          'Conhece um código secreto de palavras, expressões e sinais usado para transmitir mensagens ocultas a quem também conhece a gíria.',
      },
      {
        id: 'feat-4',
        title: 'Despertar da Mente',
        source: 'Grande Antigo · Oficial',
        snippet: 'Comunica-se telepaticamente com qualquer criatura visível.',
        description:
          'Pode se comunicar telepaticamente com uma criatura que consiga ver a até 9 m, desde que ela compreenda pelo menos um idioma. A criatura entende as mensagens telepáticas, mas não responde telepaticamente por esse recurso.',
      },
      {
        id: 'feat-5',
        title: 'Magia de Pacto',
        source: 'Bruxo 1 · Oficial',
        snippet: 'Usa Carisma como atributo de conjuração.',
        description:
          'Usa Carisma como atributo de conjuração. Os espaços de magia de Bruxo são recuperados após um descanso curto ou longo. No Bruxo 2, possui mais dois espaços de 1º círculo.',
      },
      {
        id: 'feat-6',
        title: 'Explosão Agonizante',
        source: 'Invocação · Oficial',
        snippet: 'Ao acertar com Eldritch Blast, adiciona o modificador de Carisma ao dano de cada raio.',
        description:
          'Ao acertar com Eldritch Blast, adiciona o modificador de Carisma ao dano do raio.',
      },
      {
        id: 'feat-7',
        title: 'Máscaras de Muitas Faces',
        source: 'Invocação · Oficial',
        snippet: 'Pode conjurar Disguise Self à vontade.',
        description:
          'Pode conjurar Disguise Self à vontade, sem gastar espaços de magia.',
      },
      {
        id: 'feat-8',
        title: 'Pacto de Sangue — Arsenal Vinculado',
        source: 'Homebrew',
        snippet: 'Salazar pode manifestar uma de suar armas de pacto por vez.',
        description:
          'A Lista Carmesim e Má Notícia são duas formas de um mesmo arsenal de pacto. No pacote ampliado, Salazar pode manifestar uma das formas e usar Carisma nos ataques e danos com ela. Apenas uma forma recebe a ligação mágica ativa por vez.',
      },
      {
        id: 'feat-9',
        title: 'Formação de Agente de Blutkrone',
        source: 'Homebrew',
        snippet: 'Ganha proficiência com armas de fogo e ferramentas de funileiro.',
        description:
          'Salazar recebe proficiência com armas de fogo e ferramentas de funileiro devido ao treinamento especializado em armamento, infiltração e manutenção de armas experimentais.',
      },
      {
        id: 'feat-10',
        title: 'Ação Ardilosa',
        source: 'Ladino · Oficial',
        snippet: 'Permite Correr, Desengajar ou Esconder-se como ação bônus.',
        description:
          'Permite usar as ações Correr, Desengajar ou Esconder-se como uma ação bônus em cada um de seus turnos.',
      },
      {
        id: 'feat-11',
        title: 'Pacto Armamentista',
        source: 'Homebrew',
        snippet: 'Permite usar o arsenal vinculado conforme as vontades de seu portador.',
        description:
          'Permite usar o arsenal vinculado conforme as vontades de seu portador.',
      },
    ],
    tacticalWeapons: [
      {
        id: 'tw-1',
        name: 'A Lista Carmesim',
        category: 'Arma de fogo exótica · (Pacto)',
        damage: '1d10 + 5',
        damageType: 'Perfurante ou Mágico',
        range: '2m /96 m',
        properties: ['Uma mão', 'Mágica', 'Recarga 6', 'Disparo Repetidor', 'Leve'],
        atkBonus: 7,
        dmgBonus: 5,
        iconType: 'pistol',
        damageDice: [{ die: 'd10', count: 1 }],
        description:
          'Uma pepperbox de seis disparos, construída para eliminar alvos com rapidez e permitir que Salazar continue se movimentando ou manipulando a situação ao redor.',
        profileImageUrl: undefined,
        imageGallery: [],
      },
      {
        id: 'tw-2',
        name: 'Má Notícia',
        category: 'Rifle de precisão · (Pacto)',
        damage: '2d12 + 5',
        damageDice: [{ die: 'd12', count: 2 }],
        damageType: 'Perfurante ou Mágico',
        range: '10m / 265m',
        properties: ['Duas Mãos', 'Mágica', 'Recarga 1', 'Pesada'],
        atkBonus: 7,
        dmgBonus: 5,
        iconType: 'rifle',
        description:
          'Uma arma longa, pesada e extremamente letal. Ideal para Salazar observar um alvo de longe, escolher o momento e resolver o problema com um único disparo.',
        profileImageUrl: undefined,
        imageGallery: [],
      },
      {
        id: 'tw-3',
        name: 'Briarsbane — A Espinheira',
        category: 'Bengala-espada de Lamias ocultas',
        damage: '1d12 + 4',
        damageDice: [{ die: 'd12', count: 1 }],
        damageType: 'Perfurante e Cortante',
        range: 'Corpo a corpo',
        properties: ['Uma mão', 'Finesse', 'Sangramento', 'Duas formas'],
        atkBonus: 4,
        dmgBonus: 2,
        iconType: 'sword',
        description:
          'Uma bengala elegante, aparentemente comum, que revela uma lâmina fina ao longo de sua haste e esconde um mecanismo que libera espinhos ocultos.',
        profileImageUrl: undefined,
        imageGallery: [],
      },
    ],
    inventory: [
      {
        id: 'item-1',
        name: 'Armadura de Couro Escuro Batido',
        quantity: 1,
        category: 'Equipamento',
        rarity: 'Comum',
        rarityColor: 'border-emerald-600/60 text-emerald-400 bg-emerald-950/40',
        description: 'CA 14 + DES.',
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
        equipped: false,
      },
      {
        id: 'item-3',
        name: 'Kit de Ferramentas do Ladrão',
        quantity: 1,
        category: 'Ferramenta',
        rarity: 'Especial',
        rarityColor: 'border-red-600/60 text-red-400 bg-red-950/40',
        description: 'Permite arrombar fechaduras, desarmar armadilhas e manipular mecanismos ocultos.',
        equipped: false,
      },
      {
        id: 'item-4',
        name: 'Kit de Ferramentas de Artesão',
        quantity: 1,
        category: 'Ferramenta',
        rarity: 'Especial',
        rarityColor: 'border-red-600/60 text-red-400 bg-red-950/40',
        description: 'Permite remendar utilitários, forjar peças sobressalentes e restaurar objetos danificados.',
        equipped: false,
      },
      {
        id: 'item-5',
        name: 'Kit de Ferramentas de Alquimista',
        quantity: 1,
        category: 'Ferramenta',
        rarity: 'Especial',
        rarityColor: 'border-red-600/60 text-red-400 bg-red-950/40',
        description: 'Permite destilar elixires, transmutar substâncias e neutralizar compostos perigosos.',
        equipped: false,
      },
      {
        id: 'item-6',
        name: 'Anel de Sinete de Salazar',
        quantity: 1,
        category: 'Equipamento',
        rarity: 'Especial',
        rarityColor: 'border-red-600/60 text-red-400 bg-red-950/40',
        description: 'Permite destilar elixires, transmutar substâncias e neutralizar compostos perigosos.',
        equipped: true,
      },
    ],
    coins: [
      { id: 'c-pl', name: 'Véu', symbol: 'PV', amount: 0 },
      { id: 'c-po', name: 'Aereus', symbol: 'PA', amount: 1 },
      { id: 'c-pp', name: 'Lúmen', symbol: 'PL', amount: 30 },
      { id: 'c-pc', name: 'Brasa', symbol: 'PB', amount: 0 },
    ],
    notes:
      'Salazar é um agente da Inteligência que combina um atirador de elite, um manipulador social e um ocultista especializado em sangue.',
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
