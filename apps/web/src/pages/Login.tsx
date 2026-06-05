import { useState } from 'react'
import { Eye, EyeOff, TrendingUp } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const err = await signIn(email, password)
    if (err) setError('E-mail ou senha inválidos.')
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 40%, #f3f4f6 100%)' }}>

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #2563eb 0%, transparent 70%)' }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }} />
      </div>

      <div className="w-full max-w-sm relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl items-center justify-center mb-5 shadow-lg shadow-blue-200"
            style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' }}>
            <TrendingUp size={30} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Executivo</h1>
          <p className="text-slate-500 text-sm mt-1.5">Gestão de indicadores · Empresa CHUA</p>
        </div>

        {/* Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl shadow-slate-200/60 border border-white p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100 transition-all bg-slate-50/50"
                placeholder="seu@email.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100 transition-all bg-slate-50/50 pr-11"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white rounded-xl py-3 text-sm font-bold tracking-wide transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[.98] shadow-lg shadow-blue-200 mt-2"
              style={{ background: loading ? '#93c5fd' : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Canvas Operacional · Dashboard Executivo v2.0
        </p>
      </div>
    </div>
  )
}
