import { useState, type FC, type ChangeEvent } from 'react'
import { X, Download, Upload, CheckCircle2, AlertTriangle, FileJson, User, BookOpen } from 'lucide-react'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onExport: () => void
  onImport: (jsonData: string) => void
  onLogout: () => void
  onChangeCharacter?: () => void
  onChangeSystem?: () => void
}

export const SettingsModal: FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onExport,
  onImport,
  onLogout,
  onChangeCharacter,
  onChangeSystem,
}) => {
  const [importStatus, setImportStatus] = useState<string | null>(null)
  const [errorStatus, setErrorStatus] = useState<string | null>(null)

  if (!isOpen) return null

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string
        JSON.parse(text) // Validate JSON
        onImport(text)
        setImportStatus('Dados importados com sucesso!')
        setErrorStatus(null)
        setTimeout(() => setImportStatus(null), 3000)
      } catch (err) {
        setErrorStatus('Arquivo JSON inválido. Verifique o formato.')
        setImportStatus(null)
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md bg-[#141217] border border-white/10 rounded-3xl p-6 shadow-2xl shadow-red-950/60 z-10 flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-zinc-900 border border-white/10 text-red-500 shadow-[0_0_15px_rgba(255,0,0,0.3)]">
              <FileJson size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide" style={{ fontFamily: "'Cinzel', serif" }}>
                Configurações & Backup
              </h2>
              <p className="text-xs text-zinc-400">Exportar e importar dados do Santuário</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Status messages */}
        {importStatus && (
          <div className="mt-4 p-3 rounded-2xl bg-emerald-950/60 border border-emerald-600/40 text-emerald-300 text-xs flex items-center space-x-2">
            <CheckCircle2 size={16} />
            <span>{importStatus}</span>
          </div>
        )}
        {errorStatus && (
          <div className="mt-4 p-3 rounded-2xl bg-red-950/60 border border-red-600/40 text-red-300 text-xs flex items-center space-x-2">
            <AlertTriangle size={16} />
            <span>{errorStatus}</span>
          </div>
        )}

        {/* Gestão de Personagem & Sistema */}
        <div className="mt-5 space-y-2.5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 px-1">
            Campanha & Personagem
          </h3>

          {onChangeCharacter && (
            <button
              type="button"
              onClick={() => {
                onClose()
                onChangeCharacter()
              }}
              className="w-full p-3.5 rounded-2xl bg-black/50 hover:bg-zinc-900 border border-white/10 hover:border-red-600/40 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-zinc-900 text-zinc-300 group-hover:text-red-400">
                  <User size={16} />
                </div>
                <span className="text-xs font-bold text-zinc-200 group-hover:text-white">
                  Trocar de Personagem
                </span>
              </div>
              <span className="text-[10px] text-zinc-500 font-semibold">Salazar Von Ataraxia</span>
            </button>
          )}

          {onChangeSystem && (
            <button
              type="button"
              onClick={() => {
                onClose()
                onChangeSystem()
              }}
              className="w-full p-3.5 rounded-2xl bg-black/50 hover:bg-zinc-900 border border-white/10 hover:border-red-600/40 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-zinc-900 text-zinc-300 group-hover:text-red-400">
                  <BookOpen size={16} />
                </div>
                <span className="text-xs font-bold text-zinc-200 group-hover:text-white">
                  Trocar Sistema de Regras
                </span>
              </div>
              <span className="text-[10px] text-zinc-500 font-semibold">Configurar</span>
            </button>
          )}
        </div>

        {/* Backup Actions */}
        <div className="mt-5 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 px-1">
            Gestão de Dados (JSON)
          </h3>

          {/* Export JSON */}
          <button
            type="button"
            onClick={onExport}
            className="w-full p-4 rounded-2xl bg-black/50 hover:bg-zinc-900 border border-white/10 hover:border-red-600/40 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3 text-left">
              <div className="p-2 rounded-xl bg-red-950/40 text-red-400 group-hover:scale-105 transition-transform">
                <Download size={18} />
              </div>
              <div>
                <span className="block text-sm font-semibold text-zinc-200 group-hover:text-white">
                  Exportar Ficha em JSON
                </span>
                <span className="text-xs text-zinc-500">Salvar ficha, atributos e moedas como backup local</span>
              </div>
            </div>
          </button>

          {/* Import JSON */}
          <label className="w-full p-4 rounded-2xl bg-black/50 hover:bg-zinc-900 border border-white/10 hover:border-red-600/40 transition-all flex items-center justify-between cursor-pointer group">
            <div className="flex items-center space-x-3 text-left">
              <div className="p-2 rounded-xl bg-zinc-800 text-zinc-300 group-hover:scale-105 transition-transform">
                <Upload size={18} />
              </div>
              <div>
                <span className="block text-sm font-semibold text-zinc-200 group-hover:text-white">
                  Importar Ficha em JSON
                </span>
                <span className="text-xs text-zinc-500">Carregar dados salvos anteriormente</span>
              </div>
            </div>
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Sessão */}
        <div className="mt-6 pt-5 border-t border-white/10 space-y-3">
          <button
            type="button"
            onClick={onLogout}
            className="w-full py-3 px-4 rounded-2xl bg-zinc-900 hover:bg-red-950/60 text-zinc-400 hover:text-red-300 border border-white/5 hover:border-red-900/40 transition-all text-xs font-semibold uppercase tracking-wider"
          >
            Sair da Sessão (Tela de Entrada)
          </button>
        </div>
      </div>
    </div>
  )
}

export default SettingsModal
