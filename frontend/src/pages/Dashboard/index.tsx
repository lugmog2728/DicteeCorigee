import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, TrendingUp, FileText, CalendarDays, Calendar } from 'lucide-react'
import Typography from '../../components/Typography'
import StatCard from '../../components/StatCard'
import Badge from '../../components/Badge'
import { getClasses } from '../../api/classes'
import { getPlanifications, getPlanificationStats } from '../../api/planifications'
import type { PlanificationDetail, PlanificationStats } from '../../api/planifications'
import type { ClasseApi } from '../../api/classes'

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000)
  if (diffDays <= 0) return "aujourd'hui"
  if (diffDays === 1) return 'il y a 1 jour'
  if (diffDays < 7) return `il y a ${diffDays} jours`
  if (diffDays < 14) return 'il y a 1 semaine'
  return `il y a ${Math.floor(diffDays / 7)} semaines`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

interface DashboardData {
  classes: ClasseApi[]
  planifications: PlanificationDetail[]
  stats: PlanificationStats
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([getClasses(), getPlanifications(), getPlanificationStats()])
      .then(([classes, planifications, stats]) => setData({ classes, planifications, stats }))
      .catch(() => setError('Impossible de charger les données du tableau de bord'))
      .finally(() => setLoading(false))
  }, [])

  const totalEleves = data?.classes.reduce((sum, c) => sum + c.nb_eleves, 0) ?? 0
  const nbClasses = data?.classes.length ?? 0

  const upcomingDictees = (data?.planifications ?? [])
    .filter((p) => p.statut === 'planifiee')
    .slice(0, 3)

  const recentActivity = [...(data?.planifications ?? [])]
    .filter((p) => p.statut === 'terminee' || p.statut === 'en_cours')
    .sort((a, b) => new Date(b.date_prevue).getTime() - new Date(a.date_prevue).getTime())
    .slice(0, 3)

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <Typography variant="h1">Tableau de bord</Typography>
          <Typography variant="subtitle">Vue d'ensemble de votre activité d'enseignement</Typography>
        </div>
        <p className="text-sm text-[#6a7282]">Chargement…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <Typography variant="h1">Tableau de bord</Typography>
          <Typography variant="subtitle">Vue d'ensemble de votre activité d'enseignement</Typography>
        </div>
        <p className="text-sm text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Typography variant="h1">Tableau de bord</Typography>
        <Typography variant="subtitle">Vue d'ensemble de votre activité d'enseignement</Typography>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Total des élèves"
          value={totalEleves}
          subtitle={`Sur ${nbClasses} classe${nbClasses > 1 ? 's' : ''}`}
          icon={Users}
          iconBg="var(--aqua-mist-100)"
          iconColor="var(--aqua-mist-700)"
        />
        <StatCard
          title="Performance Moyenne"
          value={`${data?.stats.taux_completion ?? 0}%`}
          subtitle="Taux de complétion"
          icon={TrendingUp}
          iconBg="#dcfce7"
          iconColor="#16a34a"
        />
        <StatCard
          title="Dictées récentes"
          value={data?.stats.cette_semaine ?? 0}
          subtitle="Cette semaine"
          icon={FileText}
          iconBg="var(--aqua-mist-100)"
          iconColor="var(--aqua-mist-700)"
        />
        <StatCard
          title="Dictées planifiées"
          value={data?.stats.en_attente ?? 0}
          subtitle="En attente"
          icon={CalendarDays}
          iconBg="var(--soft-blush-500)"
          iconColor="var(--sunlight-sand-800)"
        />
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Dictées planifiées à venir */}
        <div className="bg-white border border-black/10 rounded-[14px] p-6 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Typography variant="h4">Dictées planifiées à venir</Typography>
            <button
              type="button"
              className="text-xs text-(--ocean-blue-300) hover:underline font-normal"
              onClick={() => navigate('/bibliotheque')}
            >
              Voir plus…
            </button>
          </div>

          {upcomingDictees.length === 0 ? (
            <p className="text-sm text-[#6a7282]">Aucune dictée planifiée</p>
          ) : (
            <div className="flex flex-col gap-2">
              {upcomingDictees.map((p) => (
                <div
                  key={p.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate('/planification')}
                  onKeyDown={(e) => e.key === 'Enter' && navigate('/planification')}
                  className="border border-[#e5e7eb] rounded-[10px] px-3 pt-3 pb-2 flex flex-col gap-2 cursor-pointer hover:border-[var(--ocean-blue-300)] hover:bg-[#f8feff] transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-[#101828] truncate">{p.dictee_titre}</span>
                    <Badge label={p.dictee_niveau} variant="ocean" size="sm" />
                  </div>
                  <p className="text-xs text-[#6a7282]">
                    {p.classe_nom} • {p.nb_eleves} élève{p.nb_eleves > 1 ? 's' : ''}
                  </p>
                  <span className="flex items-center gap-1 text-xs text-[#6a7282]">
                    <Calendar size={12} className="shrink-0" />
                    {formatDate(p.date_prevue)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activité récente */}
        <div className="bg-white border border-black/10 rounded-[14px] p-6 flex flex-col gap-3">
          <Typography variant="h4">Activité récente</Typography>

          {recentActivity.length === 0 ? (
            <p className="text-sm text-[#6a7282]">Aucune activité récente</p>
          ) : (
            <div className="flex flex-col gap-3">
              {recentActivity.map((p) => (
                <div
                  key={p.id}
                  className="flex items-start gap-3 border-b border-[#f3f4f6] pb-3 last:border-b-0 last:pb-0"
                >
                  <div className="w-8 h-8 rounded-full bg-[rgba(0,145,173,0.1)] flex items-center justify-center shrink-0 mt-0.5">
                    <FileText size={16} color="var(--ocean-blue-500)" />
                  </div>
                  <div className="flex flex-col gap-1 min-w-0">
                    <p className="text-sm text-[#101828] leading-5">
                      Dictée &laquo;&nbsp;{p.dictee_titre}&nbsp;&raquo; pour {p.classe_nom} ({p.nb_eleves} élève{p.nb_eleves > 1 ? 's' : ''})
                    </p>
                    <p className="text-xs text-[#6a7282]">{formatRelativeDate(p.date_prevue)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
