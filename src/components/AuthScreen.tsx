import { useState, type FC, type FormEvent } from 'react'
import { Shield, Sparkles, ArrowRight, UserPlus, LogIn, Lock, Mail } from 'lucide-react'

interface AuthScreenProps {
  onLoginSuccess: () => void
}

export const AuthScreen: FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'welcome' | 'login' | 'register'>('welcome')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onLoginSuccess()
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

      {/* Partículas / Efeito de névoa sutil */}
      <div className="pointer-events-none absolute top-1/4 -left-20 w-72 h-72 rounded-full bg-red-900/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-1/3 -right-20 w-80 h-80 rounded-full bg-red-700/10 blur-3xl" />

      {/* Topo / Marca decorativa */}
      <div className="relative z-10 flex items-center space-x-2 text-zinc-500 text-xs tracking-[0.3em] uppercase pt-4">
        <Sparkles size={12} className="text-red-500 animate-pulse" />
        <span>Grim Dark RPG Companion</span>
        <Sparkles size={12} className="text-red-500 animate-pulse" />
      </div>

      {/* Centro: Logotipo do Elmo & Título */}
      <div className="relative z-10 flex flex-col items-center text-center my-auto max-w-sm w-full">
        <div className="relative mb-6 group cursor-pointer" onClick={() => onLoginSuccess()}>
          {/* Aura vermelha atrás do elmo */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-t from-red-600/40 via-red-900/20 to-transparent blur-2xl group-hover:blur-3xl transition-all duration-500" />
          
          <img
            src="/helm.png"
            alt="Sanctuary Helm Logo"
            className="relative w-36 h-36 sm:w-44 sm:h-44 object-contain filter drop-shadow-[0_10px_25px_rgba(255,0,0,0.45)] group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        <h1
          className="text-4xl sm:text-5xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-400"
          style={{ fontFamily: "'Cinzel', serif, system-ui" }}
        >
          SANCTUARY
        </h1>
        
        <p className="mt-2 text-sm text-zinc-400 font-medium tracking-widest uppercase">
          Guardião de Fichas & Crônicas
        </p>

        {/* Modo Formulário ou Botões Iniciais */}
        {mode === 'welcome' ? (
          <div className="w-full mt-10 space-y-4">
            {/* Botão Acessar: Estilo pílula, vermelho vibrante com glow */}
            <button
              type="button"
              onClick={() => onLoginSuccess()}
              className="w-full py-4 px-8 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold tracking-wider text-sm uppercase shadow-[0_0_25px_rgba(255,0,0,0.7)] hover:shadow-[0_0_35px_rgba(255,0,0,0.95)] active:scale-98 transition-all duration-300 flex items-center justify-center space-x-2 group"
            >
              <LogIn size={18} className="group-hover:translate-x-0.5 transition-transform" />
              <span>Acessar</span>
            </button>

            {/* Botão Cadastrar: Estilo pílula, vermelho levemente escurecido com glow */}
            <button
              type="button"
              onClick={() => onLoginSuccess()}
              className="w-full py-4 px-8 rounded-full bg-[#3d0b11] hover:bg-[#520f17] border border-red-800/60 text-red-200 font-bold tracking-wider text-sm uppercase shadow-[0_0_20px_rgba(180,0,0,0.5)] hover:shadow-[0_0_28px_rgba(200,0,0,0.7)] active:scale-98 transition-all duration-300 flex items-center justify-center space-x-2 group"
            >
              <UserPlus size={18} className="text-red-400 group-hover:scale-110 transition-transform" />
              <span>Cadastrar</span>
            </button>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-xs text-zinc-500 hover:text-zinc-300 underline underline-offset-4 transition-colors"
              >
                Acesso manual com e-mail e senha
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full mt-8 space-y-3.5 bg-black/60 backdrop-blur-md p-6 rounded-3xl border border-red-900/30">
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="email"
                placeholder="aventureiro@sanctuary.rpg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#120f14] border border-white/10 rounded-full pl-11 pr-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              />
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="password"
                placeholder="Senha de acesso"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#120f14] border border-white/10 rounded-full pl-11 pr-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3.5 px-6 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold tracking-wider text-sm uppercase shadow-[0_0_25px_rgba(255,0,0,0.7)] transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <span>{mode === 'login' ? 'Entrar no Reino' : 'Criar Conta'}</span>
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              onClick={() => setMode('welcome')}
              className="w-full text-xs text-zinc-400 hover:text-zinc-200 py-1 transition-colors"
            >
              Voltar
            </button>
          </form>
        )}
      </div>

      {/* Rodapé Informativo */}
      <div className="relative z-10 text-center text-xs text-zinc-600">
        <p className="flex items-center justify-center space-x-1.5">
          <Shield size={12} className="text-red-700" />
          <span>Versão Alpha • Sistema d20 & Custom Rulesets</span>
        </p>
      </div>
    </div>
  )
}

export default AuthScreen
