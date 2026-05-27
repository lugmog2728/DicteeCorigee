import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Calendar, AlertCircle, Users, TrendingUp } from 'lucide-react'
import StatCard from '../../components/StatCard'
import Button from '../../components/Button'
import PlanningFilters from './components/PlanningFilters'
import PlanningTable from './components/PlanningTable'
import {
  getPlanifications,
  getPlanificationStats,
  type PlanificationDetail,
  type PlanificationStats,
  type Statut,
} from '../../api/planifications'

export default function Planning() {
  const navigate = useNavigate()
  const [planifications, setPlanifications] = useState<PlanificationDetail[]>([])
  const [stats, setStats]                   = useState<PlanificationStats | null>(null)
  const [loading, setLoading]               = useState(true)
  const [filtreStatut, setFiltreStatut]     = useState<Statut | 'tous'>('tous')
  const [filtreClasse, setFiltreClasse]     = useState<number | null>(null)

  async function fetchData() {
    try {
      const [planifs, s] = await Promise.all([getPlanifications(), getPlanificationStats()])
      setPlanifications(planifs)
      setStats(s)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const classesOptions = useMemo(() => {
    const seen = new Map<number, string>()
    for (const p of planifications) {
      if (!seen.has(p.classe_id)) seen.set(p.classe_id, p.classe_nom)
    }
    return Array.from(seen.entries()).map(([id, nom]) => ({ id, nom }))
  }, [planifications])

  const planificationsFiltrees = useMemo(() => {
    return planifications.filter((p) => {
      if (filtreStatut !== 'tous' && p.statut !== filtreStatut) return false
      if (filtreClasse !== null && p.classe_id !== filtreClasse) return false
      return true
    })
  }, [planifications, filtreStatut, filtreClasse])

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between px-3 py-3">
        <div>
          <h1 className="text-[24px] font-semibold text-black leading-9">
            Planification des dictées
          </h1>
          <p className="text-[18px] font-medium text-[#ff9ad6] leading-6.75">
            Planifiez et gérez vos dictées pour vos classes
          </p>
        </div>
        <Button
          label="Planifier une dictée"
          variant="primary"
          icon={<Plus size={16} />}
          onClick={() => navigate('/planification/nouvelle')}
        />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Cette semaine"
          value={loading ? '—' : (stats?.cette_semaine ?? 0)}
          subtitle="Dictées"
          icon={Calendar}
          iconBg="#e2fefe"
          iconColor="#0091ad"
        />
        <StatCard
          title="En attente de correction"
          value={loading ? '—' : (stats?.en_attente ?? 0)}
          subtitle="Nécessitent une action"
          icon={AlertCircle}
          iconBg="#fff4e4"
          iconColor="#d5bc4c"
        />
        <StatCard
          title="Classes actives"
          value={loading ? '—' : (stats?.classes_actives ?? 0)}
          subtitle="Avec dictées planifiées"
          icon={Users}
          iconBg="#ffddf1"
          iconColor="#d5469b"
        />
        <StatCard
          title="Taux de complétion"
          value={loading ? '—' : `${stats?.taux_completion ?? 0}%`}
          subtitle="Progression moyenne"
          icon={TrendingUp}
          iconBg="#dcfce7"
          iconColor="#016630"
        />
      </div>

      {/* Filtres */}
      <PlanningFilters
        statut={filtreStatut}
        classeId={filtreClasse}
        classesOptions={classesOptions}
        onStatutChange={setFiltreStatut}
        onClasseChange={setFiltreClasse}
      />

      {/* Table */}
      {loading ? (
        <div className="bg-white border border-black/10 rounded-[14px] flex items-center justify-center py-16">
          <p className="text-sm text-[#6a7282]">Chargement...</p>
        </div>
      ) : (
        <PlanningTable planifications={planificationsFiltrees} />
      )}
    </div>
  )
}
