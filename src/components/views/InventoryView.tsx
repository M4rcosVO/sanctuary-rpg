import { useState, type FC, type FormEvent } from 'react'
import {
  Coins,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Briefcase,
  X,
  Check,
  PackagePlus,
} from 'lucide-react'
import type { CoinType, InventoryItem, ItemCategory } from '../../types/character'

interface InventoryViewProps {
  coins: CoinType[]
  onUpdateCoins: (coins: CoinType[]) => void
  items: InventoryItem[]
  onUpdateItems: (items: InventoryItem[]) => void
}

const RARITY_COLORS: Record<string, string> = {
  Comum: 'border-zinc-700 text-zinc-400 bg-zinc-900/40',
  Incomum: 'border-emerald-600/60 text-emerald-400 bg-emerald-950/40',
  Raro: 'border-blue-600/60 text-blue-400 bg-blue-950/40',
  'Muito Raro': 'border-purple-600/60 text-purple-400 bg-purple-950/40',
  Lendário: 'border-amber-600/60 text-amber-400 bg-amber-950/40',
  Especial: 'border-red-600/60 text-red-400 bg-red-950/40',
}

export const InventoryView: FC<InventoryViewProps> = ({
  coins,
  onUpdateCoins,
  items,
  onUpdateItems,
}) => {
  // Estado para adicionar moeda
  const [isAddingCoin, setIsAddingCoin] = useState(false)
  const [newCoinName, setNewCoinName] = useState('')
  const [newCoinSymbol, setNewCoinSymbol] = useState('')
  const [newCoinAmount, setNewCoinAmount] = useState(0)

  // Estado para modal de adicionar item
  const [isItemModalOpen, setIsItemModalOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const [itemQty, setItemQty] = useState(1)
  const [itemCategory, setItemCategory] = useState<ItemCategory>('Equipamento')
  const [itemRarity, setItemRarity] = useState<
    'Comum' | 'Incomum' | 'Raro' | 'Muito Raro' | 'Lendário' | 'Especial'
  >('Comum')
  const [itemDesc, setItemDesc] = useState('')

  // Alterar quantidade de uma moeda
  const handleAmountChange = (coinId: string, delta: number) => {
    onUpdateCoins(
      coins.map((c) =>
        c.id === coinId ? { ...c, amount: Math.max(0, c.amount + delta) } : c
      )
    )
  }

  // Alterar valor direto digitado de moeda
  const handleDirectAmountInput = (coinId: string, val: number) => {
    onUpdateCoins(
      coins.map((c) =>
        c.id === coinId ? { ...c, amount: Math.max(0, isNaN(val) ? 0 : val) } : c
      )
    )
  }

  // Mover moeda para cima na hierarquia (mais valiosa)
  const handleMoveUp = (index: number) => {
    if (index === 0) return
    const newCoins = [...coins]
    const temp = newCoins[index - 1]
    newCoins[index - 1] = newCoins[index]
    newCoins[index] = temp
    onUpdateCoins(newCoins)
  }

  // Mover moeda para baixo na hierarquia (menos valiosa)
  const handleMoveDown = (index: number) => {
    if (index === coins.length - 1) return
    const newCoins = [...coins]
    const temp = newCoins[index + 1]
    newCoins[index + 1] = newCoins[index]
    newCoins[index] = temp
    onUpdateCoins(newCoins)
  }

  // Adicionar nova moeda
  const handleAddCoinSubmit = () => {
    if (!newCoinName.trim()) return
    const newCoin: CoinType = {
      id: Math.random().toString(),
      name: newCoinName.trim(),
      symbol: (newCoinSymbol || newCoinName.slice(0, 2)).toUpperCase(),
      amount: newCoinAmount || 0,
    }
    onUpdateCoins([...coins, newCoin])
    setNewCoinName('')
    setNewCoinSymbol('')
    setNewCoinAmount(0)
    setIsAddingCoin(false)
  }

  // Remover moeda
  const handleRemoveCoin = (coinId: string) => {
    onUpdateCoins(coins.filter((c) => c.id !== coinId))
  }

  // Submeter novo item do formulário/modal
  const handleAddItemSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!itemName.trim()) return

    const newItem: InventoryItem = {
      id: `item-${Date.now()}`,
      name: itemName.trim(),
      quantity: Math.max(1, itemQty || 1),
      category: itemCategory,
      rarity: itemRarity,
      rarityColor: RARITY_COLORS[itemRarity] || RARITY_COLORS.Comum,
      description: itemDesc.trim() || 'Nenhuma descrição fornecida.',
      equipped: false,
    }

    onUpdateItems([newItem, ...items])

    // Limpar formulário e fechar modal
    setItemName('')
    setItemQty(1)
    setItemCategory('Equipamento')
    setItemRarity('Comum')
    setItemDesc('')
    setIsItemModalOpen(false)
  }

  // Alternar equipado
  const handleToggleEquipped = (itemId: string) => {
    onUpdateItems(
      items.map((it) => (it.id === itemId ? { ...it, equipped: !it.equipped } : it))
    )
  }

  // Alterar quantidade de item
  const handleItemQtyChange = (itemId: string, delta: number) => {
    onUpdateItems(
      items.map((it) =>
        it.id === itemId ? { ...it, quantity: Math.max(1, it.quantity + delta) } : it
      )
    )
  }

  // Remover item
  const handleRemoveItem = (itemId: string) => {
    onUpdateItems(items.filter((it) => it.id !== itemId))
  }

  return (
    <div className="space-y-5 pb-28 animate-in fade-in duration-300">
      {/* Gerenciador Econômico Customizável de Moedas */}
      <div className="rounded-3xl bg-[#141217] border border-white/10 p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3 px-1">
          <div>
            <h3 className="text-xs font-bold tracking-widest text-zinc-300 uppercase flex items-center space-x-1.5">
              <Coins size={15} className="text-amber-400" />
              <span>Tesouro & Moedas do Santuário</span>
            </h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">
              Hierarquia econômica flexível (reordenável do topo para a base)
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddingCoin(!isAddingCoin)}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[11px] font-bold hover:bg-amber-500/25 transition-colors"
          >
            <Plus size={12} />
            <span>Adicionar Moeda</span>
          </button>
        </div>

        {/* Formulário Inline para Nova Moeda */}
        {isAddingCoin && (
          <div className="p-3.5 mb-3 rounded-2xl bg-black/60 border border-amber-600/40 space-y-2.5">
            <span className="text-xs font-bold text-amber-300 flex items-center space-x-1">
              <Sparkles size={12} />
              <span>Cadastrar Novo Tipo de Moeda</span>
            </span>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Nome (ex: Platina)"
                value={newCoinName}
                onChange={(e) => setNewCoinName(e.target.value)}
                className="col-span-1.5 bg-zinc-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
              <input
                type="text"
                placeholder="Símbolo (PL)"
                value={newCoinSymbol}
                onChange={(e) => setNewCoinSymbol(e.target.value)}
                className="col-span-0.5 bg-zinc-900 border border-white/10 rounded-xl px-2 py-1.5 text-xs text-center text-amber-400 focus:outline-none focus:border-amber-500"
              />
              <input
                type="number"
                placeholder="Qtd Inicial"
                value={newCoinAmount}
                onChange={(e) => setNewCoinAmount(parseInt(e.target.value) || 0)}
                className="col-span-1 bg-zinc-900 border border-white/10 rounded-xl px-2 py-1.5 text-xs text-center text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingCoin(false)}
                className="text-xs text-zinc-400 hover:text-white px-2 py-1"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAddCoinSubmit}
                className="px-3 py-1 rounded-xl bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs"
              >
                Salvar Moeda
              </button>
            </div>
          </div>
        )}

        {/* Lista de Moedas Reordenável */}
        <div className="space-y-2">
          {coins.map((coin, index) => (
            <div
              key={coin.id}
              className="p-3 rounded-2xl bg-black/50 border border-white/5 hover:border-amber-600/30 transition-all flex items-center justify-between"
            >
              <div className="flex items-center space-x-2.5">
                {/* Botões de Reordenação Hierárquica */}
                <div className="flex flex-col space-y-0.5">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMoveUp(index)}
                    title="Mover para cima (Maior valor)"
                    className="p-0.5 text-zinc-500 hover:text-amber-400 disabled:opacity-20 transition-colors"
                  >
                    <ChevronUp size={13} />
                  </button>
                  <button
                    type="button"
                    disabled={index === coins.length - 1}
                    onClick={() => handleMoveDown(index)}
                    title="Mover para baixo (Menor valor)"
                    className="p-0.5 text-zinc-500 hover:text-amber-400 disabled:opacity-20 transition-colors"
                  >
                    <ChevronDown size={13} />
                  </button>
                </div>

                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-bold text-white">{coin.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950/80 border border-amber-800/40 text-amber-300 font-mono">
                      {coin.symbol}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-500">
                    Posição #{index + 1} na hierarquia
                  </span>
                </div>
              </div>

              {/* Controles de Quantidade */}
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleAmountChange(coin.id, -1)}
                  className="w-6 h-6 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center text-xs font-bold active:scale-95 transition-all"
                >
                  -
                </button>

                <input
                  type="number"
                  min="0"
                  value={coin.amount}
                  onChange={(e) => handleDirectAmountInput(coin.id, parseInt(e.target.value))}
                  className="w-14 text-center text-sm font-black text-amber-300 bg-black/60 border border-white/10 rounded-lg py-0.5 focus:outline-none focus:border-amber-500"
                  style={{ fontFamily: "'Cinzel', serif" }}
                />

                <button
                  type="button"
                  onClick={() => handleAmountChange(coin.id, 1)}
                  className="w-6 h-6 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center text-xs font-bold active:scale-95 transition-all"
                >
                  +
                </button>

                {coins.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveCoin(coin.id)}
                    title="Remover Moeda"
                    className="p-1 text-zinc-600 hover:text-red-400 transition-colors ml-1"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Seção de Itens do Inventário */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold tracking-widest text-zinc-400 uppercase flex items-center space-x-1.5">
            <Briefcase size={14} className="text-red-500" />
            <span>Itens da Mochila & Equipamentos ({items.length})</span>
          </h3>

          {/* Botão de Adicionar Item com Abertura Total do Modal */}
          <button
            type="button"
            onClick={() => setIsItemModalOpen(true)}
            className="flex items-center space-x-1 px-3 py-1 rounded-full bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-[0_0_12px_rgba(255,0,0,0.6)] active:scale-95 transition-all"
          >
            <PackagePlus size={13} />
            <span>+ Adicionar Item</span>
          </button>
        </div>

        {/* Lista de Itens do Inventário */}
        <div className="space-y-2.5">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-3xl bg-[#141217] border border-white/10 hover:border-red-900/50 transition-all group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-white group-hover:text-red-400 transition-colors">
                      {item.name}
                    </span>
                    {item.quantity > 1 && (
                      <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-[10px] font-mono text-zinc-300">
                        x{item.quantity}
                      </span>
                    )}
                    {item.equipped && (
                      <span className="px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-600/30 text-[9px] font-bold uppercase">
                        Equipado
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-zinc-500 block mt-0.5">{item.category}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${item.rarityColor}`}>
                    {item.rarity}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-1 text-zinc-600 hover:text-red-400 transition-colors"
                    title="Remover Item"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <p className="text-xs text-zinc-400 mt-2.5 leading-relaxed bg-black/40 p-2.5 rounded-xl border border-white/5">
                {item.description}
              </p>

              {/* Ações Rápidas no Item: Equipar/Desequipar e Ajustar Qtd */}
              <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/5 text-xs">
                <button
                  type="button"
                  onClick={() => handleToggleEquipped(item.id)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all border ${
                    item.equipped
                      ? 'bg-zinc-800 text-zinc-300 border-white/10 hover:bg-zinc-700'
                      : 'bg-red-950/60 text-red-300 border-red-800/40 hover:bg-red-900/80'
                  }`}
                >
                  {item.equipped ? 'Desequipar' : 'Equipar no Personagem'}
                </button>

                <div className="flex items-center space-x-1.5 text-zinc-400">
                  <span className="text-[10px] uppercase font-bold text-zinc-500">Qtd:</span>
                  <button
                    type="button"
                    onClick={() => handleItemQtyChange(item.id, -1)}
                    className="w-5 h-5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center font-bold"
                  >
                    -
                  </button>
                  <span className="w-5 text-center font-mono font-bold text-white text-xs">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleItemQtyChange(item.id, 1)}
                    className="w-5 h-5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL PARA ADICIONAR NOVO ITEM */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md transition-all">
          <div className="absolute inset-0" onClick={() => setIsItemModalOpen(false)} />

          <div className="relative w-full max-w-md bg-[#141217] border border-white/10 rounded-3xl p-6 shadow-2xl shadow-red-950/70 z-10 flex flex-col max-h-[90vh] overflow-y-auto">
            {/* Header do Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-2xl bg-red-950/60 text-red-500 border border-red-800/40">
                  <PackagePlus size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-wide" style={{ fontFamily: "'Cinzel', serif" }}>
                    Novo Item no Inventário
                  </h3>
                  <p className="text-[11px] text-zinc-400">Cadastre armamentos, consumíveis ou relíquias</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsItemModalOpen(false)}
                className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            {/* Formulário de Cadastro do Item */}
            <form onSubmit={handleAddItemSubmit} className="mt-4 space-y-3.5 text-left">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Nome do Item
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Ex: Frasco de Fogo Grego"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full bg-[#120f14] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                    Categoria
                  </label>
                  <select
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value as ItemCategory)}
                    className="w-full bg-[#120f14] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Equipamento">Equipamento</option>
                    <option value="Consumível">Consumível</option>
                    <option value="Ferramenta">Ferramenta</option>
                    <option value="Relíquia">Relíquia</option>
                    <option value="Componente">Componente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                    Raridade
                  </label>
                  <select
                    value={itemRarity}
                    onChange={(e) => setItemRarity(e.target.value as any)}
                    className="w-full bg-[#120f14] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Comum">Comum</option>
                    <option value="Incomum">Incomum</option>
                    <option value="Raro">Raro</option>
                    <option value="Muito Raro">Muito Raro</option>
                    <option value="Lendário">Lendário</option>
                    <option value="Especial">Especial</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Quantidade Inicial
                </label>
                <input
                  type="number"
                  min="1"
                  value={itemQty}
                  onChange={(e) => setItemQty(parseInt(e.target.value) || 1)}
                  className="w-full bg-[#120f14] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Descrição & Efeitos
                </label>
                <textarea
                  rows={3}
                  placeholder="Propriedades mecânicas, bônus e lore do item..."
                  value={itemDesc}
                  onChange={(e) => setItemDesc(e.target.value)}
                  className="w-full bg-[#120f14] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="px-4 py-2 rounded-full text-xs text-zinc-400 hover:text-white"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(255,0,0,0.6)] flex items-center space-x-1.5"
                >
                  <Check size={14} />
                  <span>Salvar no Inventário</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default InventoryView
