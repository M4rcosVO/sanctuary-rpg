import { useState, type FC } from 'react'
import {
  Coins,
  Package,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Sparkles,
} from 'lucide-react'
import type { CoinType } from '../../types/character'

interface ArsenalViewProps {
  coins: CoinType[]
  onUpdateCoins: (coins: CoinType[]) => void
}

export const ArsenalView: FC<ArsenalViewProps> = ({ coins, onUpdateCoins }) => {
  const [isAddingCoin, setIsAddingCoin] = useState(false)
  const [newCoinName, setNewCoinName] = useState('')
  const [newCoinSymbol, setNewCoinSymbol] = useState('')
  const [newCoinAmount, setNewCoinAmount] = useState(0)

  // Alterar quantidade de uma moeda
  const handleAmountChange = (coinId: string, delta: number) => {
    onUpdateCoins(
      coins.map((c) =>
        c.id === coinId ? { ...c, amount: Math.max(0, c.amount + delta) } : c
      )
    )
  }

  // Alterar valor direto digitado
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

  const equipment = [
    {
      name: 'Lâmina do Penitente',
      type: 'Arma (Espada Longa)',
      rarity: 'Raro',
      rarityColor: 'border-red-600/60 text-red-400 bg-red-950/40',
      desc: '+1 em jogadas de ataque e dano. Adiciona 1d6 de dano de fogo.',
      equipped: true,
    },
    {
      name: 'Cota de Malha Crepuscular',
      type: 'Armadura Pesada',
      rarity: 'Incomum',
      rarityColor: 'border-amber-600/60 text-amber-400 bg-amber-950/40',
      desc: 'CA 16 + 2. Resistência a dano necrótico.',
      equipped: true,
    },
    {
      name: 'Amuleto do Corvo Sangrento',
      type: 'Acessório / Relíquia',
      rarity: 'Lendário',
      rarityColor: 'border-purple-600/60 text-purple-400 bg-purple-950/40',
      desc: 'Uma vez por descanso longo, evita cair a 0 PV e restaura 15 PV.',
      equipped: true,
    },
    {
      name: 'Poção de Cura Maior (x3)',
      type: 'Consumível',
      rarity: 'Comum',
      rarityColor: 'border-zinc-700 text-zinc-400 bg-zinc-900/40',
      desc: 'Restaura 4d4 + 4 pontos de vida.',
      equipped: false,
    },
  ]

  return (
    <div className="space-y-5 pb-28 animate-in fade-in duration-300">
      {/* Gerenciador Econômico Customizável de Moedas */}
      <div className="rounded-3xl bg-[#141217] border border-white/10 p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3 px-1">
          <div>
            <h3 className="text-xs font-bold tracking-widest text-zinc-300 uppercase flex items-center space-x-1.5">
              <Coins size={15} className="text-amber-400" />
              <span>Hierarquia de Moedas & Economia</span>
            </h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">
              Ordem de valor (do topo mais valioso para a base)
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
                placeholder="Símbolo (ex: PL)"
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
                    Nível de valor #{index + 1}
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

      {/* Carga / Peso do Inventário */}
      <div className="p-4 rounded-3xl bg-[#151318] border border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-red-950/60 text-red-400 border border-red-700/40">
            <Package size={20} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Carga / Capacidade</span>
            <div className="text-base font-black text-white" style={{ fontFamily: "'Cinzel', serif" }}>
              38.5 <span className="text-xs font-medium text-zinc-400">/ 80 kg</span>
            </div>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full bg-black/50 border border-white/10 text-[10px] text-zinc-400 font-semibold">
          Capacidade Confortável
        </span>
      </div>

      {/* Itens Equipados e Mochila */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold tracking-widest text-zinc-400 uppercase">
            Arsenal & Equipamento
          </h3>
          <span className="text-xs text-red-400 font-semibold cursor-pointer hover:underline">
            + Adicionar Item
          </span>
        </div>

        <div className="space-y-2.5">
          {equipment.map((item) => (
            <div
              key={item.name}
              className="p-4 rounded-3xl bg-[#141217] border border-white/10 hover:border-red-900/50 transition-all group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-white group-hover:text-red-400 transition-colors">
                      {item.name}
                    </span>
                    {item.equipped && (
                      <span className="px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-600/30 text-[9px] font-bold uppercase">
                        Equipado
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-zinc-500 block mt-0.5">{item.type}</span>
                </div>

                <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${item.rarityColor}`}>
                  {item.rarity}
                </span>
              </div>

              <p className="text-xs text-zinc-400 mt-2.5 leading-relaxed bg-black/40 p-2.5 rounded-xl border border-white/5">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ArsenalView
