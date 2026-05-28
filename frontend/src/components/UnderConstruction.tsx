import { Wrench, Hammer, Sparkles, Clock } from 'lucide-react'

interface UnderConstructionProps {
  pageName?: string
  description?: string
}

export default function UnderConstruction({
  pageName,
  description = 'Cette page est en cours de développement et sera bientôt disponible.',
}: UnderConstructionProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-8">
      <div className="relative flex flex-col items-center gap-8 text-center max-w-sm">

        <div
          className="absolute -inset-16 -z-10 rounded-full opacity-15 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, var(--ocean-blue-300), var(--electric-pink-300))' }}
        />

        <div className="relative w-36 h-36">
          <div
            className="animate-spin absolute inset-0 rounded-full border-2 border-dashed border-[var(--ocean-blue-200)]"
            style={{ animationDuration: '25s' }}
          />
          <div className="absolute inset-3 rounded-full border border-[var(--ocean-blue-100)]" />
          <div
            className="absolute inset-6 rounded-full flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg, var(--ocean-blue-400), var(--ocean-blue-600))' }}
          >
            <Wrench size={30} color="white" strokeWidth={1.5} />
          </div>

          <div
            className="absolute -top-1 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-md animate-bounce"
            style={{
              background: 'linear-gradient(135deg, var(--electric-pink-400), var(--electric-pink-600))',
              animationDuration: '2s',
            }}
          >
            <Hammer size={15} color="white" strokeWidth={1.5} />
          </div>

          <div
            className="absolute bottom-0 -left-2 w-9 h-9 rounded-full flex items-center justify-center shadow-md animate-bounce"
            style={{
              background: 'linear-gradient(135deg, var(--sunlight-sand-700), var(--sunlight-sand-900))',
              animationDuration: '2.5s',
              animationDelay: '0.4s',
            }}
          >
            <Clock size={15} color="white" strokeWidth={1.5} />
          </div>
        </div>

        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border"
          style={{
            background: 'var(--accent-bg)',
            borderColor: 'var(--accent-border)',
            color: 'var(--accent)',
          }}
        >
          <Sparkles size={11} />
          Bientôt disponible
        </span>

        <div className="flex flex-col gap-3">
          <h2 className="text-2xl font-semibold text-[var(--text-h)] leading-tight">
            {pageName ? (
              <>
                <span style={{ color: 'var(--ocean-blue-500)' }}>{pageName}</span>
                {' '}est en construction
              </>
            ) : (
              'Page en construction'
            )}
          </h2>
          <p className="text-[var(--text)] leading-relaxed text-sm">{description}</p>
        </div>

        <div className="flex items-center gap-2">
          {([0, 150, 300] as const).map((delay) => (
            <div
              key={delay}
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: 'var(--ocean-blue-400)', animationDelay: `${delay}ms` }}
            />
          ))}
        </div>

      </div>
    </div>
  )
}
