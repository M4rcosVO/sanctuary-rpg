import type { FC } from 'react'
import { Shield, Heart, Zap, Flame, Swords, Skull, Award } from 'lucide-react'

export const HomeView: FC = () => {
  const stats = [
    { label: 'FOR', name: 'Força', val: 18, mod: '+4' },
    { label: 'DES', name: 'Destreza', val: 14, mod: '+2' },
    { label: 'CON', name: 'Constituição', val: 16, mod: '+3' },
    { label: 'INT', name: 'Inteligência', val: 10, mod: '0' },
    { label: 'SAB', name: 'Sabedoria', val: 13, mod: '+1' },
    { label: 'CAR', name: 'Carisma', val: 8, mod: '-1' },
  ]

  return (
    <div className="space-y-5 pb-24 animate-in fade-in duration-300">
      {/* Card do Personagem Principal */}
      <div className="relative rounded-3xl bg-gradient-to-b from-[#1c1822] to-[#121015] border border-white/10 p-5 shadow-2xl overflow-hidden">
        {/* Glow de fundo */}
        <div className="pointer-events-none absolute -right-10 -top-10 w-44 h-44 rounded-full bg-red-600/20 blur-3xl" />

        <div className="flex items-center space-x-4">
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-black border-2 border-red-700/60 shadow-[0_0_20px_rgba(255,0,0,0.4)] flex-shrink-0 flex items-center justify-center">
            <img
              src="/helm.png"
              alt="Avatar do Personagem"
              className="w-16 h-16 object-contain filter drop-shadow"
            />
            <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-red-700 text-[10px] font-bold text-white">
              Nv. 7
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded-full bg-red-950 border border-red-700/50 text-[10px] font-bold text-red-300 uppercase tracking-wider">
                Guerreiro das Sombras
              </span>
            </div>
            <h2 className="text-xl font-black text-white truncate tracking-wide mt-1" style={{ fontFamily: "'Cinzel', serif" }}>
              Kaelen Drakhar
            </h2>
            <p className="text-xs text-zinc-400 truncate">
              Ordem das Lâminas Negras • Humano
            </p>
          </div>
        </div>

        {/* Barras de Recursos (Vida & Vigor) */}
        <div className="mt-5 space-y-3">
          {/* Pontos de Vida */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="flex items-center space-x-1.5 text-red-400">
                <Heart size={14} className="fill-red-500 text-red-500" />
                <span>Pontos de Vida</span>
              </span>
              <span className="text-zinc-200">
                <strong className="text-red-400">68</strong> / 85 PV
              </span>
            </div>
            <div className="h-2.5 w-full bg-black/60 rounded-full overflow-hidden p-0.5 border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-red-700 to-red-500 rounded-full shadow-[0_0_12px_rgba(255,0,0,0.8)] transition-all duration-500"
                style={{ width: '80%' }}
              />
            </div>
          </div>

          {/* Vigor / Estâmina */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="flex items-center space-x-1.5 text-amber-400">
                <Zap size={14} className="fill-amber-400 text-amber-400" />
                <span>Vigor Sombrio</span>
              </span>
              <span className="text-zinc-200">
                <strong className="text-amber-400">42</strong> / 50 PE
              </span>
            </div>
            <div className="h-2.5 w-full bg-black/60 rounded-full overflow-hidden p-0.5 border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-amber-600 to-yellow-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.6)] transition-all duration-500"
                style={{ width: '84%' }}
              />
            </div>
          </div>
        </div>

        {/* Badges de Defesa e Iniciativa */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/10 text-center">
          <div className="p-2 rounded-2xl bg-black/40 border border-white/5">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500">Classe Armad.</span>
            <div className="text-base font-bold text-white flex items-center justify-center space-x-1 mt-0.5">
              <Shield size={14} className="text-red-400" />
              <span>18 CA</span>
            </div>
          </div>

          <div className="p-2 rounded-2xl bg-black/40 border border-white/5">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500">Iniciativa</span>
            <div className="text-base font-bold text-white flex items-center justify-center space-x-1 mt-0.5">
              <Flame size={14} className="text-amber-400" />
              <span>+2</span>
            </div>
          </div>

          <div className="p-2 rounded-2xl bg-black/40 border border-white/5">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500">Proficiência</span>
            <div className="text-base font-bold text-white flex items-center justify-center space-x-1 mt-0.5">
              <Award size={14} className="text-red-400" />
              <span>+3</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Atributos */}
      <div>
        <h3 className="text-xs font-bold tracking-widest text-zinc-400 uppercase mb-2 px-1 flex items-center space-x-1.5">
          <Swords size={14} className="text-red-500" />
          <span>Atributos Principais</span>
        </h3>

        <div className="grid grid-cols-3 gap-2.5">
          {stats.map((s) => (
            <div
              key={s.label}
              className="p-3 rounded-2xl bg-[#151318] border border-white/10 hover:border-red-600/40 transition-all flex flex-col items-center justify-center text-center group cursor-pointer shadow-lg"
            >
              <span className="text-[10px] font-bold text-zinc-400 group-hover:text-red-400 transition-colors uppercase">
                {s.label}
              </span>
              <span className="text-lg font-black text-white my-0.5" style={{ fontFamily: "'Cinzel', serif" }}>
                {s.val}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-red-950/80 border border-red-800/50 text-[10px] font-bold text-red-300">
                {s.mod}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Ações Rápidas de Combate */}
      <div className="rounded-3xl bg-[#141217] border border-white/10 p-4">
        <h3 className="text-xs font-bold tracking-widest text-zinc-400 uppercase mb-3 flex items-center space-x-1.5">
          <Skull size={14} className="text-red-500" />
          <span>Ataques & Poderes Prontos</span>
        </h3>

        <div className="space-y-2.5">
          <div className="p-3 rounded-2xl bg-black/50 border border-white/5 flex items-center justify-between hover:border-red-600/30 transition-colors">
            <div>
              <span className="text-sm font-bold text-zinc-100">Espada Larga do Julgamento</span>
              <p className="text-xs text-zinc-500">1d10 + 4 Cortante • Alcance 1.5m</p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-red-600 text-white font-bold text-xs shadow-[0_0_10px_rgba(255,0,0,0.5)]">
              +7 Ataque
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-black/50 border border-white/5 flex items-center justify-between hover:border-red-600/30 transition-colors">
            <div>
              <span className="text-sm font-bold text-zinc-100">Golpe Sombrio (Smite)</span>
              <p className="text-xs text-zinc-500">+2d8 Necrótico • Consome 1 Vigor</p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-[#2e0e15] border border-red-800/50 text-red-300 font-bold text-xs">
              Especial
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomeView
