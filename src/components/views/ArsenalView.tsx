import type { FC } from 'react'
import { Coins, Package } from 'lucide-react'

export const ArsenalView: FC = () => {
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
    <div className="space-y-5 pb-24 animate-in fade-in duration-300">
      {/* Resumo do Inventário */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-3xl bg-[#151318] border border-white/10 flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-amber-950/60 text-amber-400 border border-amber-700/40">
            <Coins size={20} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Tesouro</span>
            <div className="text-base font-black text-amber-300" style={{ fontFamily: "'Cinzel', serif" }}>
              245 <span className="text-xs font-medium text-zinc-400">PO</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-[#151318] border border-white/10 flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-red-950/60 text-red-400 border border-red-700/40">
            <Package size={20} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Carga / Peso</span>
            <div className="text-base font-black text-white" style={{ fontFamily: "'Cinzel', serif" }}>
              38.5 <span className="text-xs font-medium text-zinc-400">/ 80 kg</span>
            </div>
          </div>
        </div>
      </div>

      {/* Itens Equipados e Mochila */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold tracking-widest text-zinc-400 uppercase">
            Arsenal & Equipamento Ativo
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
