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
import { InventoryView } from './components/views/InventoryView'
import { TacticalView } from './components/views/TacticalView'
import type { Character, SystemType, RollRequest, CoinType } from './types/character'

type AuthStep = 'auth' | 'system-select' | 'character-select' | 'app'

export function App() {
  // Fluxo de Etapas: Entrada -> Sistema -> Personagem -> App Principal
  const [authStep, setAuthStep] = useState<AuthStep>('auth')

  // Sistema Selecionado
  const [currentSystem, setCurrentSystem] = useState<SystemType>('dnd5e')

  // Personagem Selecionado
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>('salazar-1')

  // Aba ativa na navegação inferior (Ficha, Arsenal, Inventário, Tático)
  const [currentTab, setCurrentTab] = useState<NavTab>('home')

  // Estado da Gaveta/Modal do Rolador de Dados
  const [isDiceRollerOpen, setIsDiceRollerOpen] = useState<boolean>(false)
  const [currentRollRequest, setCurrentRollRequest] = useState<RollRequest | null>(null)

  // Estado do Modal de Configurações
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false)

  // Ficha Completa de D&D 5e: Salazar Von Ataraxia (Scholar / Engineer)
  const [characters, setCharacters] = useState<Character[]>([
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
      xp: {
        current: 6500,
        next: 14000,
      },
      hp: {
        current: 48,
        max: 48,
        temp: 0,
      },
      speed: '9m (30ft)',
      ca: 15,
      initiative: 3,
      proficiency: 3,
      passivePerception: 14,
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

  // Atualizar inventário do personagem ativo
  const handleUpdateInventory = (newItems: any[]) => {
    handleUpdateActiveCharacter((prev) => ({
      ...prev,
      inventory: newItems,
    }))
  }

  // Atualizar estado tático
  const handleUpdateTacticalState = (
    updater: (prev: Character['tacticalState']) => Character['tacticalState']
  ) => {
    handleUpdateActiveCharacter((prev) => ({
      ...prev,
      tacticalState: updater(prev.tacticalState),
    }))
  }

  // Criar novo personagem para o sistema ativo
  const handleCreateNewCharacter = () => {
    const newChar: Character = {
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
        { id: 'sk-animais', name: 'Adestrar Animais', attributeShort: 'SAB', proficiency: 'none' },
        { id: 'sk-arcanismo', name: 'Arcanismo', attributeShort: 'INT', proficiency: 'none' },
        { id: 'sk-atletismo', name: 'Atletismo', attributeShort: 'FOR', proficiency: 'proficient' },
        { id: 'sk-atuacao', name: 'Atuação', attributeShort: 'CAR', proficiency: 'none' },
        { id: 'sk-enganacao', name: 'Enganação', attributeShort: 'CAR', proficiency: 'none' },
        { id: 'sk-historia', name: 'História', attributeShort: 'INT', proficiency: 'none' },
        { id: 'sk-intimidacao', name: 'Intimidação', attributeShort: 'CAR', proficiency: 'proficient' },
        { id: 'sk-intuicao', name: 'Intuição', attributeShort: 'SAB', proficiency: 'none' },
        { id: 'sk-investigacao', name: 'Investigação', attributeShort: 'INT', proficiency: 'none' },
        { id: 'sk-medicina', name: 'Medicina', attributeShort: 'SAB', proficiency: 'none' },
        { id: 'sk-natureza', name: 'Natureza', attributeShort: 'INT', proficiency: 'none' },
        { id: 'sk-percepcao', name: 'Percepção', attributeShort: 'SAB', proficiency: 'proficient' },
        { id: 'sk-persuasao', name: 'Persuasão', attributeShort: 'CAR', proficiency: 'none' },
        { id: 'sk-prestidigitacao', name: 'Prestidigitação', attributeShort: 'DES', proficiency: 'none' },
        { id: 'sk-religiao', name: 'Religião', attributeShort: 'INT', proficiency: 'none' },
        { id: 'sk-sobrevivencia', name: 'Sobrevivência', attributeShort: 'SAB', proficiency: 'proficient' },
        { id: 'sk-furtividade', name: 'Furtividade', attributeShort: 'DES', proficiency: 'none' },
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
        },
      ],
      inventory: [
        {
          id: `item-${Date.now()}-1`,
          name: 'Cota de Malha Padrão',
          quantity: 1,
          category: 'Equipamento',
          rarity: 'Comum',
          rarityColor: 'border-zinc-700 text-zinc-400 bg-zinc-900/40',
          description: 'Armadura pesada forjada em ferro.',
          equipped: true,
        },
      ],
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
      },
    }

    setCharacters((prev) => [...prev, newChar])
    setSelectedCharacterId(newChar.id)
    setAuthStep('app')
  }

  // Click-to-Roll acionado da ficha ou arsenal
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
    arsenal: 'Arsenal Tático',
    inventory: 'Inventário',
    tactical: 'Auxiliar Tático',
  }

  // 1. TELA DE ENTRADA / LOGIN (FIXO: CapMarcola / Gellak@2520)
  if (authStep === 'auth') {
    return (
      <AuthScreen
        onLoginSuccess={(_user) => {
          setAuthStep('system-select')
        }}
      />
    )
  }

  // 2. SELEÇÃO DE SISTEMA
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

  // 3. SELEÇÃO DE PERSONAGEM (Regra: Apenas personagens do sistema ativo)
  if (authStep === 'character-select') {
    return (
      <CharacterSelectView
        currentSystem={currentSystem}
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
            weapons={activeCharacter.tacticalWeapons}
            onTriggerRoll={handleTriggerRoll}
          />
        )}
        {currentTab === 'inventory' && (
          <InventoryView
            coins={activeCharacter.coins}
            onUpdateCoins={handleUpdateCoins}
            items={activeCharacter.inventory || []}
            onUpdateItems={handleUpdateInventory}
          />
        )}
        {currentTab === 'tactical' && (
          <TacticalView
            tacticalState={activeCharacter.tacticalState}
            onUpdateTacticalState={handleUpdateTacticalState}
          />
        )}
      </main>

      {/* Barra de Navegação Inferior Flutuante (Ficha, Arsenal, Inventário, Tático) */}
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
