import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Plus, TrendingUp, TrendingDown, Eye, Users, BarChart2, BookOpen, AlertTriangle } from 'lucide-react'
import { getClasse, getClasseStats } from '../../../api/classes'
import type { ClasseApi, ClasseStats, EleveStatItem } from '../../../api/classes'
import ModalAjoutEleves from './components/ModalAjoutEleves'

function formatRelativeDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return "aujourd'hui"
  if (days === 1) return 'il y a 1 jour'
  return `il y a ${days} jours`
}

function MoyenneBadge({ value }: { value: number | null }) {
  if (value === null) return <span className="text-[14px] text-[#6a7282]">—</span>
  let bg = '#ffbce4', color = '#ab347b'
  if (value >= 90)      { bg = '#dcfce7'; color = '#016630' }
  else if (value >= 70) { bg = '#c1eef7'; color = '#005768' }
  else if (value >= 40) { bg = '#fcf6db'; color = '#c9ae2e' }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-medium whitespace-nowrap" style={{ backgroundColor: bg, color }}>
      {value}%
    </span>
  )
}

function TrendBadge({ value }: { value: number | null }) {
  if (value === null) return null
  const up = value >= 0
  return (
    <span className={`inline-flex items-center gap-0.5 text-[12px] ${up ? 'text-[#016630]' : 'text-[#ab347b]'}`}>
      {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      {up ? '+' : ''}{value}%
    </span>
  )
}

function StatCard({ label, value, sub, iconBg, icon }: {
  label:  string
  value:  string | number
  sub:    string
  iconBg: string
  icon:   React.ReactNode
}) {
  return (
    <div className="bg-white border border-[rgba(0,0,0,0.1)] rounded-[14px] p-6 flex flex-col gap-6 flex-1 min-w-0">
      <div className="flex items-center justify-between">
        <span className="text-[14px] font-medium text-[#4a5565]">{label}</span>
        <div className="size-9 rounded-[10px] flex items-center justify-center shrink-0" style={{ backgroundColor: iconBg }}>
          {icon}
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-[24px] font-semibold text-[#101828] leading-8">{value}</span>
        <span className="text-[12px] text-[#6a7282]">{sub}</span>
      </div>
    </div>
  )
}

function EleveRow({ eleve }: { eleve: EleveStatItem }) {
  return (
    <tr className="border-b border-[#f3f4f6] last:border-0 hover:bg-[#fafafa]">
      <td className="px-4 py-4">
        <span className="text-[16px] font-medium text-[#101828]">
          {eleve.prenom} {eleve.initiale}.
        </span>
        {eleve.dispositif && (
          <span className="ml-2 text-[11px] text-[#6a7282] bg-[#f3f4f6] px-1.5 py-0.5 rounded-full">
            {eleve.dispositif}
          </span>
        )}
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-1.5">
          <MoyenneBadge value={eleve.moyenne} />
          <TrendBadge value={eleve.trend} />
        </div>
      </td>
      <td className="px-4 py-4 text-[14px] text-[#101828]">
        {eleve.derniere_dictee_score !== null ? `${eleve.derniere_dictee_score}%` : '—'}
      </td>
      <td className="px-4 py-4 text-[14px] text-[#4a5565]">{eleve.total_corrections}</td>
      <td className="px-4 py-4 text-[14px] text-[#4a5565]">{formatRelativeDate(eleve.derniere_date)}</td>
      <td className="px-4 py-4">
        <button type="button" className="flex items-center gap-1 text-[14px] font-medium text-[#0a0a0a] hover:text-[#0091ad]">
          <Eye size={16} />
          Voir
        </button>
      </td>
    </tr>
  )
}

export default function ClasseDetail() {
  const { classeId } = useParams<{ classeId: string }>()
  const navigate = useNavigate()

  const [classe, setClasse]   = useState<ClasseApi | null>(null)
  const [stats, setStats]     = useState<ClasseStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  async function fetchData() {
    if (!classeId) return
    try {
      const [c, s] = await Promise.all([
        getClasse(Number(classeId)),
        getClasseStats(Number(classeId)),
      ])
      setClasse(c)
      setStats(s)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [classeId]) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <p className="text-sm text-[#6a7282]">Chargement...</p>
  if (!classe || !stats) return <p className="text-sm text-[#6a7282]">Classe introuvable.</p>

  const moyenneLabel = stats.moyenne_generale !== null
    ? `${stats.moyenne_generale.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`
    : '—'

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => navigate('/classes')}
            className="flex items-center gap-1.5 text-[14px] text-[#6a7282] hover:text-[#0a0a0a] transition-colors mb-2 w-fit"
          >
            <ChevronLeft size={16} />
            Retour aux Classes
          </button>
          <h1 className="text-[24px] font-semibold text-black leading-9">{classe.nom}</h1>
          <p className="text-[18px] font-medium text-[#ff9ad6]">
            {classe.nom} · {classe.annee_scolaire}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:items-center">
          <button type="button" className="border border-[rgba(0,0,0,0.1)] rounded-lg px-4 py-2 text-[14px] font-medium text-[#0a0a0a] bg-white hover:bg-[#f3f4f6] flex items-center gap-2">
            <BarChart2 size={16} />
            Voir les stat
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#0091ad] rounded-lg px-4 py-2 text-[14px] font-medium text-white hover:bg-[#007a93]"
          >
            <Plus size={16} />
            Ajouter des élèves
          </button>
          <button
            type="button"
            onClick={() => navigate('/planification/nouvelle', { state: { classeId: classe.id } })}
            className="flex items-center gap-2 bg-[#0091ad] rounded-lg px-4 py-2 text-[14px] font-medium text-white hover:bg-[#007a93]"
          >
            <Plus size={16} />
            Planifier une dictée
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="flex flex-col sm:flex-row gap-4">
        <StatCard
          label="Total élèves"
          value={stats.total_eleves}
          sub="élèves dans la classe"
          iconBg="#ffeef8"
          icon={<Users size={18} className="text-[#ab347b]" />}
        />
        <StatCard
          label="Moyenne générale"
          value={moyenneLabel}
          sub="Performance de la classe"
          iconBg="#dcfce7"
          icon={<TrendingUp size={18} className="text-[#016630]" />}
        />
        <StatCard
          label="Total dictée"
          value={stats.total_dictees_planifiees}
          sub="Dictées planifiées"
          iconBg="#e2fefe"
          icon={<BookOpen size={18} className="text-[#005768]" />}
        />
        <StatCard
          label="Élèves en difficulté"
          value={stats.eleves_en_difficulte}
          sub="≤ 40% de moyenne"
          iconBg="#fff4e4"
          icon={<AlertTriangle size={18} className="text-[#c9ae2e]" />}
        />
      </div>

      {/* Students table */}
      <div className="bg-white border border-[rgba(0,0,0,0.1)] rounded-[14px] overflow-hidden">
        <div className="px-6 py-5">
          <h2 className="text-[18px] font-medium text-black">Dictées planifiées</h2>
        </div>
        {stats.eleves.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <p className="text-[16px] font-medium text-[#364153]">Aucun élève pour l'instant</p>
            <p className="text-[14px] text-[#6a7282]">Ajoutez des élèves pour commencer</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e5e7eb]">
                  {["Nom de l'Élève", 'Moyenne', 'Dernière Dictée', 'Total Dictées', 'Dernière Date', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[12px] font-medium text-[#6a7282] uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.eleves.map(eleve => <EleveRow key={eleve.id} eleve={eleve} />)}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <ModalAjoutEleves
          classeId={classe.id}
          classeNom={classe.nom}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchData}
        />
      )}
    </div>
  )
}
