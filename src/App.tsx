import { useState } from 'react'
import { Header } from './components/Header'
import { BottomNav, type NavTab } from './components/BottomNav'
import { AuthScreen } from './components/AuthScreen'
import { SystemSelectView } from './components/onboarding/SystemSelectView'
import { CharacterSelectView } from './components/onboarding/CharacterSelectView'
import { DiceRollerModal } from './components/DiceRollerModal'
import { SettingsModal } from './components/SettingsModal'
import { SyncIndicator } from './components/SyncIndicator'
import { HomeView } from './components/views/HomeView'
import { ArsenalView } from './components/views/ArsenalView'
import { InventoryView } from './components/views/InventoryView'
import { TacticalView } from './components/views/TacticalView'
import type { RollRequest, SystemType } from './types/character'
import { useCharacterStore } from './hooks/useCharacterStore'
import { isSupabaseConfigured } from './lib/supabase'

type AuthStep = 'auth' | 'system-select' | 'character-select' | 'app'

export function App() {
  // ─── Identificador de Usuário e Fluxo de Autenticação ─────────────────────
  const [currentUser, setCurrentUser] = useState<string>(() => {
    return localStorage.getItem('sanctuary_user_id') || 'CapMarcola'
  })
  const [authStep, setAuthStep] = useState<AuthStep>('auth')
  const [currentSystem, setCurrentSystem] = useState<SystemType>('dnd5e')

  // ─── Estado central de personagens (com persistência automática) ──────────
  const store = useCharacterStore(currentUser)

  // ─── UI State ─────────────────────────────────────────────────────────────
  const [currentTab, setCurrentTab] = useState<NavTab>('home')
  const [isDiceRollerOpen, setIsDiceRollerOpen] = useState(false)
  const [currentRollRequest, setCurrentRollRequest] = useState<RollRequest | null>(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const { activeCharacter } = store

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleTriggerRoll = (request: RollRequest) => {
    setCurrentRollRequest(request)
    setIsDiceRollerOpen(true)
  }

  const handleExportJSON = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(activeCharacter, null, 2))
    const a = document.createElement('a')
    a.setAttribute('href', dataStr)
    a.setAttribute(
      'download',
      `santuario_${activeCharacter.name.toLowerCase().replace(/\s+/g, '_')}_ficha.json`
    )
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  const handleImportJSON = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString)
      store.updateActiveCharacter((prev) => ({ ...prev, ...parsed }))
    } catch (e) {
      console.error('Erro ao importar JSON:', e)
    }
  }

  const handleCreateNewCharacter = () => {
    const newChar = {
      id: `char-${Date.now()}`,
      name: 'Novo Aventureiro',
      concept: 'Guerreiro / Explorador',
      system: currentSystem,
      systemName:
        currentSystem === 'dnd5e'
          ? 'D&D 5e • Guerreiro'
          : currentSystem === 't20'
          ? 'Tormenta20 • Cavaleiro'
          : currentSystem === 'ordem'
          ? 'Ordem Paranormal • Combatente'
          : 'Customizado • Aventureiro',
      level: 1,
      race: 'Humano',
      background: 'Soldado',
      alignment: 'Neutro',
      xp: { current: 0, next: 300 },
      hp: { current: 12, max: 12, temp: 0 },
      speed: '9m (30ft)',
      ca: 14,
      initiative: 1,
      proficiency: 2,
      passivePerception: 11,
      profileImageUrl: undefined,
      imageGallery: [],
      attributes: [
        { id: 'for', name: 'Força', short: 'FOR', value: 16, modifier: 3, savingThrowProficient: true },
        { id: 'des', name: 'Destreza', short: 'DES', value: 12, modifier: 1, savingThrowProficient: false },
        { id: 'con', name: 'Constituição', short: 'CON', value: 14, modifier: 2, savingThrowProficient: true },
        { id: 'int', name: 'Inteligência', short: 'INT', value: 10, modifier: 0, savingThrowProficient: false },
        { id: 'sab', name: 'Sabedoria', short: 'SAB', value: 12, modifier: 1, savingThrowProficient: false },
        { id: 'car', name: 'Carisma', short: 'CAR', value: 10, modifier: 0, savingThrowProficient: false },
      ],
      skills: [
        { id: 'sk-acrobacia', name: 'Acrobacia', attributeShort: 'DES', proficiency: 'none' },
        { id: 'sk-atletismo', name: 'Atletismo', attributeShort: 'FOR', proficiency: 'proficient' },
        { id: 'sk-percepcao', name: 'Percepção', attributeShort: 'SAB', proficiency: 'proficient' },
        { id: 'sk-intimidacao', name: 'Intimidação', attributeShort: 'CAR', proficiency: 'proficient' },
        { id: 'sk-sobrevivencia', name: 'Sobrevivência', attributeShort: 'SAB', proficiency: 'proficient' },
      ],
      languages: ['Comum'],
      proficienciesList: {
        armor: ['Armaduras Leves', 'Armaduras Médias', 'Armaduras Pesadas', 'Escudos'],
        weapons: ['Armas Simples', 'Armas Marciais'],
        tools: ['Jogo de Dados'],
      },
      features: [
        {
          id: 'feat-g1',
          title: 'Estilo de Luta (Defesa)',
          source: 'Guerreiro Nv. 1',
          snippet: '+1 na CA quando estiver usando armadura.',
          description: 'Enquanto estiver usando armadura, você ganha um bônus de +1 na sua Classe de Armadura.',
        },
      ],
      tacticalWeapons: [
        {
          id: 'tw-g1',
          name: 'Espada Longa de Aço',
          category: 'Arma Marcial',
          damage: '1d8 + 3',
          damageDice: [{ die: 'd8', count: 1 }],
          damageType: 'Cortante',
          range: '1.5m',
          properties: ['Versátil (1d10)'],
          atkBonus: 5,
          dmgBonus: 3,
          iconType: 'sword',
          description: 'Espada de aço forjado afiada e confiável.',
          profileImageUrl: undefined,
          imageGallery: [],
        },
      ],
      inventory: [],
      coins: [
        { id: 'c-po', name: 'Ouro', symbol: 'PO', amount: 15 },
        { id: 'c-pp', name: 'Prata', symbol: 'PP', amount: 20 },
      ],
      notes: 'Um guerreiro recém-chegado ao Santuário pronto para batalhar.',
      tacticalState: {
        inspiration: false,
        gadgetSlots: { current: 1, max: 1 },
        infusionsActive: { current: 0, max: 0 },
        activeConditions: [],
        carmesimSlots: { current: 6, max: 6 },
        badNewsSlots: { current: 1, max: 1 },
        badNewsSpecialSlots: { current: 1, max: 1 },
      },
    } as any

    store.setCharacters([...store.characters, newChar])
    store.setSelectedCharacterId(newChar.id)
    setAuthStep('app')
  }

  const tabTitles: Record<NavTab, string> = {
    home: 'Santuário',
    arsenal: 'Arsenal Tático',
    inventory: 'Inventário',
    tactical: 'Auxiliar Tático',
  }

  // ─── TELA DE LOGIN ────────────────────────────────────────────────────────
  if (authStep === 'auth') {
    return (
      <AuthScreen
        onLoginSuccess={(userIdentifier) => {
          const user = userIdentifier?.trim() || 'CapMarcola'
          setCurrentUser(user)
          localStorage.setItem('sanctuary_user_id', user)
          setAuthStep('system-select')
        }}
      />
    )
  }

  // ─── SELEÇÃO DE SISTEMA ───────────────────────────────────────────────────
  if (authStep === 'system-select') {
    return (
      <SystemSelectView
        currentSystem={currentSystem}
        onSelectSystem={(sys) => {
          setCurrentSystem(sys)
          setAuthStep('character-select')
        }}
        onBackToLogin={() => setAuthStep('auth')}
      />
    )
  }

  // ─── SELEÇÃO DE PERSONAGEM ────────────────────────────────────────────────
  if (authStep === 'character-select') {
    return (
      <CharacterSelectView
        currentSystem={currentSystem}
        characters={store.characters}
        selectedCharacterId={store.selectedCharacterId}
        onSelectCharacter={(charId) => {
          store.setSelectedCharacterId(charId)
          setAuthStep('app')
        }}
        onCreateNewCharacter={handleCreateNewCharacter}
        onBackToSystemSelect={() => setAuthStep('system-select')}
      />
    )
  }

  // ─── APP PRINCIPAL ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen w-full bg-black text-zinc-100 flex flex-col relative selection:bg-red-900 selection:text-white">
      {/* Luz ambiente carmesim */}
      <div className="pointer-events-none fixed -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-red-950/20 rounded-full blur-3xl z-0" />
      <div className="pointer-events-none fixed bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-60 bg-red-900/15 rounded-full blur-3xl z-0" />

      {/* Header Superior */}
      <Header
        title={tabTitles[currentTab]}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onLogoClick={() => setCurrentTab('home')}
      />

      {/* Indicador de sincronização */}
      <SyncIndicator
        status={store.syncStatus}
        error={store.syncError}
        cloudUserId={store.cloudUserId}
      />

      {/* Conteúdo Principal — responsivo com max-w-md mobile e max-w-4xl desktop */}
      <main className="relative z-10 flex-1 w-full max-w-4xl mx-auto px-3 sm:px-4 md:px-6 pt-4">
        {currentTab === 'home' && (
          <HomeView
            character={activeCharacter}
            onUpdateCharacter={store.updateActiveCharacter}
            onTriggerRoll={handleTriggerRoll}
          />
        )}
        {currentTab === 'arsenal' && (
          <ArsenalView
            weapons={activeCharacter.tacticalWeapons}
            onTriggerRoll={handleTriggerRoll}
            onUpdateWeapons={store.updateWeapons}
          />
        )}
        {currentTab === 'inventory' && (
          <InventoryView
            coins={activeCharacter.coins}
            onUpdateCoins={store.updateCoins}
            items={activeCharacter.inventory ?? []}
            onUpdateItems={store.updateInventory}
          />
        )}
        {currentTab === 'tactical' && (
          <TacticalView
            tacticalState={activeCharacter.tacticalState}
            onUpdateTacticalState={store.updateTacticalState}
          />
        )}
      </main>

      {/* Barra de Navegação Inferior */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onDiceRollClick={() => {
          setCurrentRollRequest(null)
          setIsDiceRollerOpen(true)
        }}
      />

      {/* Modal Rolador de Dados */}
      <DiceRollerModal
        isOpen={isDiceRollerOpen}
        initialRollRequest={currentRollRequest}
        onClose={() => {
          setIsDiceRollerOpen(false)
          setCurrentRollRequest(null)
        }}
      />

      {/* Modal de Configurações */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onExport={handleExportJSON}
        onImport={handleImportJSON}
        onChangeCharacter={() => setAuthStep('character-select')}
        onChangeSystem={() => setAuthStep('system-select')}
        onLogout={() => {
          setIsSettingsOpen(false)
          setAuthStep('auth')
        }}
        currentUser={currentUser}
        syncStatus={store.syncStatus}
        onForceSync={store.forceSync}
        isCloudConfigured={isSupabaseConfigured}
      />
    </div>
  )
}

export default App
