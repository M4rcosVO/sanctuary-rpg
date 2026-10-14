import { useState } from 'react'
import { Header } from './components/Header'
import { BottomNav, type NavTab } from './components/BottomNav'
import { AuthScreen } from './components/AuthScreen'
import { SystemSelectView } from './components/onboarding/SystemSelectView'
import { CharacterSelectView } from './components/onboarding/CharacterSelectView'
import { DiceRollerModal } from './components/DiceRollerModal'
import { SettingsModal } from './components/SettingsModal'
import { HomeView } from './components/views/HomeView'
import { ArsenalView } from './components/views/ArsenalView'
import { CalendarView } from './components/views/CalendarView'
import { DocumentsView } from './components/views/DocumentsView'
import type { Character, SystemType, RollRequest, CoinType } from './types/character'

type AuthStep = 'auth' | 'system-select' | 'character-select' | 'app'

export function App() {
  // Fluxo de Etapas: Entrada -> Sistema -> Personagem -> App Principal
  const [authStep, setAuthStep] = useState<AuthStep>('auth')

  // Sistema Selecionado
  const [currentSystem, setCurrentSystem] = useState<SystemType>('dnd5e')

  // Personagem Selecionado
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>('salazar-1')

  // Aba ativa na navegação inferior
  const [currentTab, setCurrentTab] = useState<NavTab>('home')

  // Estado da Gaveta/Modal do Rolador de Dados
  const [isDiceRollerOpen, setIsDiceRollerOpen] = useState<boolean>(false)
  const [currentRollRequest, setCurrentRollRequest] = useState<RollRequest | null>(null)

  // Estado do Modal de Configurações
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false)

  // Ficha Padrão: Salazar Von Ataraxia (Scholar / Engineer)
  const [characters, setCharacters] = useState<Character[]>([
    {
      id: 'salazar-1',
      name: 'Salazar Von Ataraxia',
      concept: 'Scholar / Engineer',
      system: 'dnd5e',
      systemName: 'D&D 5e • Artífice',
      level: 5,
      hp: { current: 48, max: 48 },
      energy: { current: 36, max: 40, label: 'Pontos de Ação' },
      ca: 15,
      initiative: 3,
      proficiency: 3,
      attributes: [
        { id: 'for', name: 'Força', short: 'FOR', value: 10, modifier: 0 },
        { id: 'des', name: 'Destreza', short: 'DES', value: 16, modifier: 3 },
        { id: 'con', name: 'Constituição', short: 'CON', value: 14, modifier: 2 },
        { id: 'int', name: 'Inteligência', short: 'INT', value: 18, modifier: 4 },
        { id: 'sab', name: 'Sabedoria', short: 'SAB', value: 13, modifier: 1 },
        { id: 'car', name: 'Carisma', short: 'CAR', value: 12, modifier: 1 },
      ],
      attacks: [
        {
          id: 'atk-1',
          name: 'Pistola de Chispa Arcana',
          bonus: '+7',
          modNum: 7,
          damage: '1d10 + 4',
          type: 'Perfurante / Energia',
        },
        {
          id: 'atk-2',
          name: 'Chave Inglesa Reforçada',
          bonus: '+5',
          modNum: 5,
          damage: '1d6 + 3',
          type: 'Contundente',
        },
        {
          id: 'atk-3',
          name: 'Engenhoca de Choque Sombrio',
          bonus: '+7',
          modNum: 7,
          damage: '3d8 Elétrico',
          type: 'CD 15 Destreza',
        },
      ],
      coins: [
        { id: 'c-pl', name: 'Platina', symbol: 'PL', amount: 8 },
        { id: 'c-po', name: 'Ouro', symbol: 'PO', amount: 184 },
        { id: 'c-pp', name: 'Prata', symbol: 'PP', amount: 45 },
        { id: 'c-pc', name: 'Cobre', symbol: 'PC', amount: 32 },
      ],
      notes:
        'Erudito mecânico e arquiteto de engenhocas do Santuário. Especialista em forjar mecanismos autômatos e soluções arcanas para perigos mortais.',
    },
  ])

  // Personagem ativo
  const activeCharacter =
    characters.find((c) => c.id === selectedCharacterId) || characters[0]

  // Atualizar dados do personagem ativo
  const handleUpdateActiveCharacter = (updater: (prev: Character) => Character) => {
    setCharacters((prevList) =>
      prevList.map((c) => (c.id === activeCharacter.id ? updater(c) : c))
    )
  }

  // Atualizar moedas do personagem ativo
  const handleUpdateCoins = (newCoins: CoinType[]) => {
    handleUpdateActiveCharacter((prev) => ({
      ...prev,
      coins: newCoins,
    }))
  }

  // Criar novo personagem
  const handleCreateNewCharacter = () => {
    const newChar: Character = {
      id: `char-${Date.now()}`,
      name: 'Novo Aventureiro',
      concept: 'Guerreiro / Explorador',
      system: currentSystem,
      systemName:
        currentSystem === 'dnd5e'
          ? 'D&D 5e'
          : currentSystem === 't20'
          ? 'Tormenta20'
          : currentSystem === 'ordem'
          ? 'Ordem Paranormal'
          : 'Customizado',
      level: 1,
      hp: { current: 20, max: 20 },
      energy: { current: 10, max: 10, label: 'Energia' },
      ca: 12,
      initiative: 1,
      proficiency: 2,
      attributes: [
        { id: 'for', name: 'Força', short: 'FOR', value: 14, modifier: 2 },
        { id: 'des', name: 'Destreza', short: 'DES', value: 12, modifier: 1 },
        { id: 'con', name: 'Constituição', short: 'CON', value: 14, modifier: 2 },
        { id: 'int', name: 'Inteligência', short: 'INT', value: 10, modifier: 0 },
        { id: 'sab', name: 'Sabedoria', short: 'SAB', value: 11, modifier: 0 },
        { id: 'car', name: 'Carisma', short: 'CAR', value: 10, modifier: 0 },
      ],
      attacks: [
        {
          id: `atk-${Date.now()}`,
          name: 'Espada Curta',
          bonus: '+4',
          modNum: 4,
          damage: '1d6 + 2',
          type: 'Cortante',
        },
      ],
      coins: [
        { id: 'c-po', name: 'Ouro', symbol: 'PO', amount: 15 },
        { id: 'c-pp', name: 'Prata', symbol: 'PP', amount: 20 },
      ],
      notes: 'Um aventureiro recém-chegado aos portões do Santuário.',
    }

    setCharacters((prev) => [...prev, newChar])
    setSelectedCharacterId(newChar.id)
    setAuthStep('app')
  }

  // Click-to-Roll acionado da ficha
  const handleTriggerRoll = (request: RollRequest) => {
    setCurrentRollRequest(request)
    setIsDiceRollerOpen(true)
  }

  // Exportar dados do personagem ativo em JSON
  const handleExportJSON = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(activeCharacter, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute(
      'download',
      `santuario_${activeCharacter.name.toLowerCase().replace(/\s+/g, '_')}_ficha.json`
    )
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  // Importar dados do personagem ativo em JSON
  const handleImportJSON = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString)
      handleUpdateActiveCharacter((prev) => ({ ...prev, ...parsed }))
    } catch (e) {
      console.error('Erro ao importar JSON:', e)
    }
  }

  // Mapeamento dos títulos para o Header
  const tabTitles: Record<NavTab, string> = {
    home: 'Santuário',
    arsenal: 'Arsenal',
    calendar: 'Calendário',
    documents: 'Documentos',
  }

  // 1. TELA DE AUTENTICAÇÃO
  if (authStep === 'auth') {
    return (
      <AuthScreen
        onLoginSuccess={(_user) => {
          setAuthStep('system-select')
        }}
      />
    )
  }

  // 2. ETAPA DE ONBOARDING: SELEÇÃO DE SISTEMA
  if (authStep === 'system-select') {
    return (
      <SystemSelectView
        currentSystem={currentSystem}
        onSelectSystem={(sys) => {
          setCurrentSystem(sys)
          // Atualiza a ficha padrão com o nome do sistema se necessário
          handleUpdateActiveCharacter((prev) => ({
            ...prev,
            system: sys,
            systemName:
              sys === 'dnd5e'
                ? 'D&D 5e • Artífice'
                : sys === 't20'
                ? 'Tormenta20 • Engenhoqueiro'
                : sys === 'ordem'
                ? 'Ordem Paranormal • Especialista'
                : 'Customizado • Erudito',
          }))
          setAuthStep('character-select')
        }}
        onBackToLogin={() => setAuthStep('auth')}
      />
    )
  }

  // 3. ETAPA DE ONBOARDING: SELEÇÃO DE PERSONAGEM (Salazar Von Ataraxia)
  if (authStep === 'character-select') {
    return (
      <CharacterSelectView
        characters={characters}
        selectedCharacterId={selectedCharacterId}
        onSelectCharacter={(charId) => {
          setSelectedCharacterId(charId)
          setAuthStep('app')
        }}
        onCreateNewCharacter={handleCreateNewCharacter}
        onBackToSystemSelect={() => setAuthStep('system-select')}
      />
    )
  }

  // 4. APLICATIVO PRINCIPAL DO SANTUÁRIO
  return (
    <div className="min-h-screen w-full bg-black text-zinc-100 flex flex-col relative selection:bg-red-900 selection:text-white">
      {/* Luz ambiente de fundo carmesim */}
      <div className="pointer-events-none fixed -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-red-950/20 rounded-full blur-3xl z-0" />
      <div className="pointer-events-none fixed bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-60 bg-red-900/15 rounded-full blur-3xl z-0" />

      {/* Header Superior com Elmo, Título da Tela e Engrenagem */}
      <Header
        title={tabTitles[currentTab]}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onLogoClick={() => setCurrentTab('home')}
      />

      {/* Conteúdo Principal Centralizado (Layout Mobile-First / Max-w-md) */}
      <main className="relative z-10 flex-1 w-full max-w-md mx-auto px-4 pt-4">
        {currentTab === 'home' && (
          <HomeView
            character={activeCharacter}
            onUpdateCharacter={handleUpdateActiveCharacter}
            onTriggerRoll={handleTriggerRoll}
          />
        )}
        {currentTab === 'arsenal' && (
          <ArsenalView
            coins={activeCharacter.coins}
            onUpdateCoins={handleUpdateCoins}
          />
        )}
        {currentTab === 'calendar' && <CalendarView />}
        {currentTab === 'documents' && <DocumentsView />}
      </main>

      {/* Barra de Navegação Inferior Flutuante */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        onDiceRollClick={() => {
          setCurrentRollRequest(null)
          setIsDiceRollerOpen(true)
        }}
      />

      {/* Gaveta / Modal do Rolador de Dados (Suporte a Ação Direta Click-to-Roll & Desaceleração) */}
      <DiceRollerModal
        isOpen={isDiceRollerOpen}
        initialRollRequest={currentRollRequest}
        onClose={() => {
          setIsDiceRollerOpen(false)
          setCurrentRollRequest(null)
        }}
      />

      {/* Modal de Configurações & Export/Import JSON */}
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
      />
    </div>
  )
}

export default App
