import { useState, type FC, type FormEvent } from 'react'
import { Sparkles, ArrowRight, UserPlus, LogIn, Lock, User, AlertCircle, CheckCircle2 } from 'lucide-react'

interface AuthScreenProps {
  onLoginSuccess: (userIdentifier: string) => void
}

export const AuthScreen: FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [view, setView] = useState<'welcome' | 'login' | 'register'>('welcome')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [offlineAccountNotice, setOfflineAccountNotice] = useState(false)

  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!identifier.trim()) {
      setErrorMsg('Informe seu username ou e-mail.')
      return
    }
    if (!password || password.length < 4) {
      setErrorMsg('A senha deve conter no mínimo 4 caracteres.')
      return
    }
    setErrorMsg(null)
    onLoginSuccess(identifier.trim())
  }

  const handleCreateOfflineAccount = (e: FormEvent) => {
    e.preventDefault()
    if (!identifier.trim()) {
      setErrorMsg('Informe um nome ou username para sua conta local.')
      return
    }
    setErrorMsg(null)
    setOfflineAccountNotice(true)
    setTimeout(() => {
      onLoginSuccess(identifier.trim())
    }, 1200)
  }

  return (
    <div className="relative min-h-screen w-full bg-black text-white flex flex-col justify-between items-center px-6 py-12 overflow-hidden select-none">
      {/* Gradiente radial em vermelho sangue no rodapé */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[65vh] w-full"
        style={{
          background:
            'radial-gradient(circle at 50% 100%, rgba(220, 20, 30, 0.45) 0%, rgba(90, 0, 10, 0.3) 35%, rgba(0, 0, 0, 0.95) 75%, #000000 100%)',
        }}
      />

      {/* Partículas / Efeito de névoa carmesim */}
      <div className="pointer-events-none absolute top-1/4 -left-20 w-72 h-72 rounded-full bg-red-900/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-1/3 -right-20 w-80 h-80 rounded-full bg-red-700/10 blur-3xl" />

      {/* Topo / Marca decorativa limpa */}
      <div className="relative z-10 flex items-center space-x-2 text-zinc-400 text-xs tracking-[0.25em] uppercase pt-2">
        <Sparkles size={12} className="text-red-500 animate-pulse" />
        <span>Guardião de Fichas & Crônicas</span>
        <Sparkles size={12} className="text-red-500 animate-pulse" />
      </div>

      {/* Centro: Logotipo do Elmo & Título Santuário */}
      <div className="relative z-10 flex flex-col items-center text-center my-auto max-w-sm w-full">
        <div
          className="relative mb-6 group cursor-pointer"
          onClick={() => {
            if (view === 'welcome') setView('login')
          }}
        >
          {/* Aura vermelha atrás do elmo */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-t from-red-600/40 via-red-900/20 to-transparent blur-2xl group-hover:blur-3xl transition-all duration-500" />

          <img
            src="/helm.png"
            alt="Santuário Elmo Logo"
            className="relative w-36 h-36 sm:w-44 sm:h-44 object-contain filter drop-shadow-[0_10px_25px_rgba(255,0,0,0.45)] group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        <h1
          className="text-4xl sm:text-5xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-400"
          style={{ fontFamily: "'Cinzel', serif, system-ui" }}
        >
          SANTUÁRIO
        </h1>

        {/* View 1: Botões Iniciais (Acessar / Cadastrar) */}
        {view === 'welcome' && (
          <div className="w-full mt-10 space-y-4">
            {/* Botão Acessar -> Abre formulário real de login */}
            <button
              type="button"
              onClick={() => {
                setErrorMsg(null)
                setView('login')
              }}
              className="w-full py-4 px-8 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold tracking-wider text-sm uppercase shadow-[0_0_25px_rgba(255,0,0,0.7)] hover:shadow-[0_0_35px_rgba(255,0,0,0.95)] active:scale-98 transition-all duration-300 flex items-center justify-center space-x-2 group"
            >
              <LogIn size={18} className="group-hover:translate-x-0.5 transition-transform" />
              <span>Acessar</span>
            </button>

            {/* Botão Cadastrar */}
            <button
              type="button"
              onClick={() => {
                setErrorMsg(null)
                setView('register')
              }}
              className="w-full py-4 px-8 rounded-full bg-[#3d0b11] hover:bg-[#520f17] border border-red-800/60 text-red-200 font-bold tracking-wider text-sm uppercase shadow-[0_0_20px_rgba(180,0,0,0.5)] hover:shadow-[0_0_28px_rgba(200,0,0,0.7)] active:scale-98 transition-all duration-300 flex items-center justify-center space-x-2 group"
            >
              <UserPlus size={18} className="text-red-400 group-hover:scale-110 transition-transform" />
              <span>Cadastrar</span>
            </button>
          </div>
        )}

        {/* View 2: Formulário Real de Login */}
        {view === 'login' && (
          <form
            onSubmit={handleLoginSubmit}
            className="w-full mt-8 space-y-3.5 bg-black/75 backdrop-blur-md p-6 rounded-3xl border border-red-900/40 shadow-2xl text-left"
          >
            <div className="text-center mb-4">
              <h2 className="text-lg font-bold text-white tracking-wide" style={{ fontFamily: "'Cinzel', serif" }}>
                Entrar no Santuário
              </h2>
              <p className="text-xs text-zinc-400">Insira suas credenciais de aventureiro</p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-2xl bg-red-950/80 border border-red-700/60 text-red-200 text-xs flex items-center space-x-2">
                <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 ml-1">
                Username ou E-mail
              </label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  autoFocus
                  placeholder="salazar ou seu@email.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-[#120f14] border border-white/10 rounded-full pl-11 pr-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 ml-1">
                Senha
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#120f14] border border-white/10 rounded-full pl-11 pr-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-3 py-3.5 px-6 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold tracking-wider text-sm uppercase shadow-[0_0_25px_rgba(255,0,0,0.7)] hover:shadow-[0_0_35px_rgba(255,0,0,0.9)] active:scale-98 transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <span>Confirmar e Entrar</span>
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              onClick={() => {
                setErrorMsg(null)
                setView('welcome')
              }}
              className="w-full text-center text-xs text-zinc-400 hover:text-zinc-200 py-1 transition-colors block"
            >
              Voltar
            </button>
          </form>
        )}

        {/* View 3: Cadastro / Conta Offline */}
        {view === 'register' && (
          <form
            onSubmit={handleCreateOfflineAccount}
            className="w-full mt-8 space-y-4 bg-black/75 backdrop-blur-md p-6 rounded-3xl border border-red-900/40 shadow-2xl text-left"
          >
            <div className="text-center mb-3">
              <h2 className="text-lg font-bold text-white tracking-wide" style={{ fontFamily: "'Cinzel', serif" }}>
                Conta Local Offline
              </h2>
              <div className="p-2.5 rounded-2xl bg-amber-950/40 border border-amber-800/40 text-amber-200/90 text-xs mt-2 text-left">
                <strong>Aviso:</strong> O cadastro em nuvem está desabilitado temporariamente. Você criará uma conta local segura armazenada no seu dispositivo.
              </div>
            </div>

            {offlineAccountNotice && (
              <div className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-700/60 text-emerald-200 text-xs flex items-center space-x-2">
                <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                <span>Conta local criada com sucesso! Carregando...</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 rounded-2xl bg-red-950/80 border border-red-700/60 text-red-200 text-xs flex items-center space-x-2">
                <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 ml-1">
                Nome do Jogador / Aventureiro
              </label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Ex: Salazar ou Marcos"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-[#120f14] border border-white/10 rounded-full pl-11 pr-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={offlineAccountNotice}
              className="w-full mt-2 py-3.5 px-6 rounded-full bg-[#3d0b11] hover:bg-[#520f17] border border-red-800/60 text-red-200 hover:text-white font-bold tracking-wider text-sm uppercase shadow-[0_0_20px_rgba(180,0,0,0.5)] active:scale-98 transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <UserPlus size={16} />
              <span>Criar Perfil Offline</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setErrorMsg(null)
                setView('welcome')
              }}
              className="w-full text-center text-xs text-zinc-400 hover:text-zinc-200 py-1 transition-colors block"
            >
              Voltar
            </button>
          </form>
        )}
      </div>

      {/* Rodapé Informativo */}
      <div className="relative z-10 text-center text-xs text-zinc-600">
        <p>Santuário RPG • Versão Alpha</p>
      </div>
    </div>
  )
}

export default AuthScreen
