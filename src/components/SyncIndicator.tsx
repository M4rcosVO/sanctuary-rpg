import type { FC } from 'react'
import { Cloud, CloudOff, CheckCircle2, Loader2, AlertTriangle, HardDrive } from 'lucide-react'
import type { SyncStatus } from '../hooks/useCharacterStore'
import { isSupabaseConfigured } from '../lib/supabase'

interface SyncIndicatorProps {
  status: SyncStatus
  error: string | null
  cloudUserId: string | null
}

export const SyncIndicator: FC<SyncIndicatorProps> = ({ status, error, cloudUserId }) => {
  if (status === 'idle') return null

  const isCloud = isSupabaseConfigured && cloudUserId

  return (
    <div
      className={`fixed top-14 right-3 z-40 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold shadow-lg border transition-all animate-in fade-in slide-in-from-right-2 duration-300 ${
        status === 'saving'
          ? 'bg-zinc-900 border-zinc-700 text-zinc-400'
          : status === 'saved'
          ? 'bg-emerald-950 border-emerald-800/60 text-emerald-400'
          : status === 'error'
          ? 'bg-red-950 border-red-800/60 text-red-400'
          : 'bg-zinc-900 border-zinc-700 text-zinc-500'
      }`}
      title={error ?? undefined}
    >
      {status === 'saving' && (
        <>
          <Loader2 size={12} className="animate-spin" />
          <span>Salvando...</span>
        </>
      )}
      {status === 'saved' && (
        <>
          <CheckCircle2 size={12} />
          <span>{isCloud ? 'Sincronizado' : 'Salvo'}</span>
          {isCloud ? <Cloud size={11} className="opacity-60" /> : <HardDrive size={11} className="opacity-60" />}
        </>
      )}
      {status === 'error' && (
        <>
          <AlertTriangle size={12} />
          <span>Falha ao salvar</span>
          {isCloud ? <CloudOff size={11} /> : null}
        </>
      )}
    </div>
  )
}

export default SyncIndicator
