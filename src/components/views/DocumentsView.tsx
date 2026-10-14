import type { FC } from 'react'
import { Bookmark, Scroll, ChevronRight } from 'lucide-react'

export const DocumentsView: FC = () => {
  const quests = [
    {
      title: 'A Profecia das Sete Chamas',
      category: 'Missão Principal',
      status: 'Em Progresso',
      desc: 'Encontrar os três fragmentos da coroa esquecida nas ruínas de Mor-Thul.',
    },
    {
      title: 'O Contrato da Guilda dos Mercenários',
      category: 'Missão Secundária',
      status: 'Concluído',
      desc: 'Eliminar os salteadores que bloqueavam a passagem pelo Desfiladeiro Sombrio.',
    },
  ]

  const notes = [
    { title: 'Fraqueza dos Espectros do Vazio', date: 'Ontem', preview: 'Fogo celestial e dano radiante causam dano dobrado...' },
    { title: 'Nomes dos Cavaleiros Renegados', date: '3 dias atrás', preview: 'Sir Valen, Lady Morgana e o Arqueiro Cego...' },
  ]

  return (
    <div className="space-y-5 pb-24 animate-in fade-in duration-300">
      {/* Missões Ativas */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold tracking-widest text-zinc-400 uppercase px-1 flex items-center space-x-1.5">
          <Scroll size={14} className="text-red-500" />
          <span>Missões & Objetivos</span>
        </h3>

        <div className="space-y-2.5">
          {quests.map((q) => (
            <div
              key={q.title}
              className="p-4 rounded-3xl bg-[#141217] border border-white/10 hover:border-red-900/40 transition-all"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">
                  {q.category}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    q.status === 'Concluído'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                      : 'bg-red-950 text-red-300 border border-red-800/40'
                  }`}
                >
                  {q.status}
                </span>
              </div>
              <h4 className="text-sm font-bold text-white">{q.title}</h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{q.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Diário de Campanha & Anotações */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold tracking-widest text-zinc-400 uppercase flex items-center space-x-1.5">
            <Bookmark size={14} className="text-red-500" />
            <span>Anotações da Campanha</span>
          </h3>
          <span className="text-xs text-red-400 font-semibold cursor-pointer hover:underline">
            + Nova Nota
          </span>
        </div>

        <div className="space-y-2.5">
          {notes.map((note) => (
            <div
              key={note.title}
              className="p-4 rounded-3xl bg-[#141217] border border-white/10 hover:border-red-900/40 transition-all flex items-center justify-between group cursor-pointer"
            >
              <div>
                <span className="text-[10px] text-zinc-500">{note.date}</span>
                <h4 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors">
                  {note.title}
                </h4>
                <p className="text-xs text-zinc-400 truncate max-w-[240px] mt-0.5">{note.preview}</p>
              </div>
              <ChevronRight size={18} className="text-zinc-600 group-hover:text-red-400 group-hover:translate-x-1 transition-all" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DocumentsView
