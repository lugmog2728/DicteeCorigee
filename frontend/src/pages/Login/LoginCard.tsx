import { useState } from 'react'
import { Mail, Lock, ArrowRight } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function LoginCard() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: Location })?.from?.pathname ?? '/'

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch {
      setError('Identifiants incorrects. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white border border-[rgba(0,145,173,0.2)] rounded-[14px] shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)] w-full max-w-md p-6">
      <div className="mb-6">
        <p className="text-[16px] font-medium text-[#0a0a0a] leading-4 mb-2">Connexion</p>
        <p className="text-[16px] text-[#717182] leading-6">Connectez-vous à votre compte enseignant</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-[14px] font-medium text-[#0a0a0a] leading-3.5">
            Adresse e-mail
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#717182] pointer-events-none" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nom@ecole.fr"
              className="w-full h-9 bg-[#f3f3f5] border border-transparent rounded-lg pl-10 pr-3 text-[14px] text-[#0a0a0a] placeholder:text-[#717182] outline-none focus:border-(--ocean-blue-500)"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-[14px] font-medium text-[#0a0a0a] leading-3.5">
              Mot de passe
            </label>
            <button type="button" className="text-[12px] text-(--ocean-blue-500) hover:underline">
              Mot de passe oublié ?
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#717182] pointer-events-none" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-9 bg-[#f3f3f5] border border-transparent rounded-lg pl-10 pr-3 text-[14px] text-[#0a0a0a] placeholder:text-[#717182] outline-none focus:border-(--ocean-blue-500)"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="size-4 rounded-sm accent-(--ocean-blue-500)"
          />
          <span className="text-[14px] text-[#0a0a0a] leading-5">Se souvenir de moi</span>
        </label>

        {error && (
          <p className="text-[13px] text-[#d4183d] leading-5">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-10 bg-(--ocean-blue-500) hover:bg-(--ocean-blue-600) text-white text-[14px] font-medium rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Connexion…' : 'Se Connecter'}
          {!loading && <ArrowRight size={16} />}
        </button>
      </form>
    </div>
  )
}
