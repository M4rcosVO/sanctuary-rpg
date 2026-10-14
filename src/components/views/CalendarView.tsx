import type { FC } from 'react'
import { Calendar, Clock, MapPin, Users, Moon } from 'lucide-react'

export const CalendarView: FC = () => {
  const events = [
    {
      title: 'Sessão 14: O Cerco à Fortaleza de Cinzas',
      date: 'Sábado, 19:30',
      location: 'Covil do Arquimago Malakor',
      dm: 'Mestre Gabriel',
      isNext: true,
    },
    {
      title: 'Fase Lunar: Alinhamento da Lua de Sangue',
      date: 'Dia 14 do Mês do Corvo',
      location: 'Plano Material',
      dm: 'Evento Cósmico (Bônus para Magia Necrótica)',
      isNext: false,
    },
    {
      title: 'Audiente Real com o Lorde Protetor',
      date: 'Dia 18 do Mês do Corvo',
      location: 'Cidadela de Ferro',
      dm: 'Diplomacia / Entrega da Relíquia',
      isNext: false,
    },
  ]

  return (
    <div className="space-y-5 pb-24 animate-in fade-in duration-300">
      {/* Próxima Sessão Destaque */}
      <div className="relative rounded-3xl bg-gradient-to-br from-red-950/60 via-[#18121a] to-[#121015] border border-red-700/50 p-5 shadow-2xl overflow-hidden">
        <div className="pointer-events-none absolute -right-6 -bottom-6 w-36 h-36 bg-red-600/30 rounded-full blur-2xl" />

        <div className="flex items-center justify-between mb-3">
          <span className="px-3 py-1 rounded-full bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-[0_0_12px_rgba(255,0,0,0.6)]">
            Próxima Sessão
          </span>
          <div className="flex items-center space-x-1 text-xs text-red-300 font-semibold">
            <Clock size={14} />
            <span>Faltam 3 dias</span>
          </div>
        </div>

        <h3 className="text-lg font-bold text-white tracking-wide" style={{ fontFamily: "'Cinzel', serif" }}>
          {events[0].title}
        </h3>

        <div className="mt-3.5 space-y-1.5 text-xs text-zinc-300">
          <div className="flex items-center space-x-2">
            <Calendar size={14} className="text-red-400" />
            <span>{events[0].date}</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin size={14} className="text-red-400" />
            <span>{events[0].location}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users size={14} className="text-red-400" />
            <span>{events[0].dm} • 4 Jogadores Confirmados</span>
          </div>
        </div>
      </div>

      {/* Linha do Tempo e Eventos */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold tracking-widest text-zinc-400 uppercase px-1">
          Eventos & Cronologia do Reino
        </h3>

        <div className="space-y-2.5">
          {events.slice(1).map((ev) => (
            <div
              key={ev.title}
              className="p-4 rounded-3xl bg-[#141217] border border-white/10 hover:border-red-900/40 transition-all"
            >
              <div className="flex items-center space-x-2 text-zinc-400 text-xs mb-1">
                <Moon size={14} className="text-purple-400" />
                <span>{ev.date}</span>
              </div>
              <h4 className="text-sm font-bold text-white">{ev.title}</h4>
              <p className="text-xs text-zinc-400 mt-1">{ev.location} • {ev.dm}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CalendarView
