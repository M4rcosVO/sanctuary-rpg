import { useState, type FC, type FormEvent } from 'react'
import { ArrowRight, UserPlus, LogIn, Lock, User, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react'

interface AuthScreenProps {
  onLoginSuccess: (userIdentifier: string) => void
}

export const AuthScreen: FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [view, setView] = useState<'welcome' | 'login' | 'register'>('welcome')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [offlineAccountNotice, setOfflineAccountNotice] = useState(false)

  // Credenciais Oficiais Fixas exigidas
  const REQUIRED_LOGIN = 'CapMarcola'
  const REQUIRED_PASS = 'Gellak@2520'

  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmedUser = identifier.trim()
    const trimmedPass = password.trim()

    if (!trimmedUser || !trimmedPass) {
      setErrorMsg('Preencha o login e a senha para acessar.')
      return
    }

    if (trimmedUser !== REQUIRED_LOGIN || trimmedPass !== REQUIRED_PASS) {
      setErrorMsg('Credenciais inválidas. Verifique o usuário e a senha de acesso.')
      return
    }

    setErrorMsg(null)
    onLoginSuccess(trimmedUser)
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
      {/* Gradiente radial em vermelho sangue no rodapé (Ajustado para dissipar sem cortes) */}
      <div
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={{
          background:
            'radial-gradient(circle at 50% 100%, rgba(220, 20, 30, 0.45) 0%, rgba(90, 0, 10, 0.2) 35%, rgba(0, 0, 0, 0.95) 70%, #000000 100%)',
        }}
      />

      {/* Névoa carmesim de fundo */}
      <div className="pointer-events-none absolute top-1/4 -left-20 w-72 h-72 rounded-full bg-red-900/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-1/3 -right-20 w-80 h-80 rounded-full bg-red-700/10 blur-3xl" />

      {/* Topo decorativo */}
      <div className="relative z-10 flex items-center space-x-2 text-zinc-500 text-xs tracking-[0.25em] uppercase pt-2">
        <ShieldCheck size={14} className="text-red-500" />
        <span>Acesso Restrito ao Reino</span>
      </div>

      {/* Centro: Logotipo do Elmo, Título Santuário e Subtítulo abaixo */}
      <div className="relative z-10 flex flex-col items-center text-center my-auto max-w-sm w-full">
        <div
          className="relative mb-5 group cursor-pointer"
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

        {/* Título Principal */}
        <h1
          className="text-4xl sm:text-5xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-400"
          style={{ fontFamily: "'Cinzel', serif, system-ui" }}
        >
          SANTUÁRIO
        </h1>

        {/* Subtítulo posicionado exatamente abaixo do título */}
        <p className="mt-2 text-sm text-zinc-400 font-medium tracking-widest uppercase">
          Guardião de fichas e crônicas
        </p>

        {/* View 1: Botões Iniciais (Acessar / Cadastrar) */}
        {view === 'welcome' && (
          <div className="w-full mt-10 space-y-4">
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

            <button
              type="button"
              onClick={() => {
                setErrorMsg(null)
                setView('register')
              }}
              className="w-full py-4 px-8 rounded-full bg-[#3d0b11] hover:bg-[#520f17] border border-red-800/60 text-red-200 font-bold tracking-wider text-sm uppercase shadow-[0_0_20px_rgba(180,0,0,0.5)] hover:shadow-[0_0_28px_rgba(200,0,0,0.7)] active:scale-98 transition-all duration-300 flex items-center justify-center space-x-2 group"
            >
              <UserPlus size={18} className="text-red-400 group-hover:scale-110 transition-transform" />
              <span>Cadastrar - Inativo</span>
            </button>
          </div>
        )}

        {/* View 2: Formulário Real com Login Fixo */}
        {view === 'login' && (
          <form
            onSubmit={handleLoginSubmit}
            className="w-full mt-8 space-y-3.5 bg-black/80 backdrop-blur-md p-6 rounded-3xl border border-red-900/40 shadow-2xl text-left"
          >
            <div className="text-center mb-3">
              <h2 className="text-lg font-bold text-white tracking-wide" style={{ fontFamily: "'Cinzel', serif" }}>
                Autenticação de Acesso
              </h2>
              <p className="text-xs text-zinc-400">Insira as credenciais do Santuário</p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-2xl bg-red-950/80 border border-red-700/60 text-red-200 text-xs flex items-center space-x-2">
                <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 ml-1">
                Login / Usuário
              </label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Digite seu usuário"
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
              <span>Entrar no Santuário</span>
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

        {/* View 3: Cadastro Offline */}
        {view === 'register' && (
          <form
            onSubmit={handleCreateOfflineAccount}
            className="w-full mt-8 space-y-4 bg-black/80 backdrop-blur-md p-6 rounded-3xl border border-red-900/40 shadow-2xl text-left"
          >
            <div className="text-center mb-3">
              <h2 className="text-lg font-bold text-white tracking-wide" style={{ fontFamily: "'Cinzel', serif" }}>
                Conta Local Offline
              </h2>
              <div className="p-2.5 rounded-2xl bg-amber-950/40 border border-amber-800/40 text-amber-200/90 text-xs mt-2 text-left">
                <strong>Aviso:</strong> O cadastro em nuvem está desabilitado temporariamente. Você criará uma sessão local segura no dispositivo.
              </div>
            </div>

            {offlineAccountNotice && (
              <div className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-700/60 text-emerald-200 text-xs flex items-center space-x-2">
                <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                <span>Perfil criado! Redirecionando...</span>
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
                Nome do Jogador
              </label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Nome do Jogador"
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
              <span>Criar Sessão Local</span>
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
