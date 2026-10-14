import { useState } from 'react'
import { Header } from './components/Header'
import { BottomNav, type NavTab } from './components/BottomNav'
import { AuthScreen } from './components/AuthScreen'
import { DiceRollerModal } from './components/DiceRollerModal'
import { SettingsModal } from './components/SettingsModal'
import { HomeView } from './components/views/HomeView'
import { ArsenalView } from './components/views/ArsenalView'
import { CalendarView } from './components/views/CalendarView'
import { DocumentsView } from './components/views/DocumentsView'

export function App() {
  // Estado para alternar entre a Tela de Entrada/Login e o Aplicativo
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)

  // Estado para alternar entre as telas da barra de navegação
  const [currentTab, setCurrentTab] = useState<NavTab>('home')

  // Estado para abrir/fechar a gaveta do Rolador de Dados (botão '+')
  const [isDiceRollerOpen, setIsDiceRollerOpen] = useState<boolean>(false)

  // Estado para abrir/fechar o modal de Configurações & Export/Import JSON (engrenagem)
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false)

  // Dados mockados do personagem para suporte ao export/import JSON
  const [characterData, setCharacterData] = useState({
    name: 'Kaelen Drakhar',
    class: 'Guerreiro das Sombras',
    level: 7,
    hp: { current: 68, max: 85 },
    energy: { current: 42, max: 50 },
    stats: { for: 18, des: 14, con: 16, int: 10, sab: 13, car: 8 },
  })

  // Exportar dados do personagem em JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(characterData, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute('download', `sanctuary_${characterData.name.toLowerCase().replace(/\s+/g, '_')}_backup.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  // Importar dados do personagem em JSON
  const handleImportJSON = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString)
      setCharacterData((prev) => ({ ...prev, ...parsed }))
    } catch (e) {
      console.error('Erro ao importar JSON:', e)
    }
  }

  // Mapeamento dos títulos para o Header
  const tabTitles: Record<NavTab, string> = {
    home: 'Sanctuary',
    arsenal: 'Arsenal',
    calendar: 'Calendário',
    documents: 'Documentos',
  }

  // Se não estiver autenticado, exibe a Tela de Entrada / Login
  if (!isAuthenticated) {
    return <AuthScreen onLoginSuccess={() => setIsAuthenticated(true)} />
  }

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
        {currentTab === 'home' && <HomeView />}
        {currentTab === 'arsenal' && <ArsenalView />}
        {currentTab === 'calendar' && <CalendarView />}
        {currentTab === 'documents' && <DocumentsView />}
      </main>

      {/* Barra de Navegação Inferior Flutuante */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        onDiceRollClick={() => setIsDiceRollerOpen(true)}
      />

      {/* Gaveta / Modal do Rolador de Dados (Ao clicar no botão vermelho '+') */}
      <DiceRollerModal
        isOpen={isDiceRollerOpen}
        onClose={() => setIsDiceRollerOpen(false)}
      />

      {/* Modal de Configurações & Export/Import JSON */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onExport={handleExportJSON}
        onImport={handleImportJSON}
        onLogout={() => {
          setIsSettingsOpen(false)
          setIsAuthenticated(false)
        }}
      />
    </div>
  )
}

export default App
