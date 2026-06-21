import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ChevronLeft, Users, BarChart2, BookOpen, Star, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react'
import { getClasse, getClasseStats } from '../../api/classes'
import type { ClasseApi, ClasseStats } from '../../api/classes'
import { getCorrections } from '../../api/corrections'
import type { CorrectionRead } from '../../api/corrections'
import { CATEGORIES } from '../Correction/constants'
import type { CategoryKey } from '../Correction/constants'

// ── Level helpers ─────────────────────────────────────────────────────────────

const LEVEL_CONFIG = [
  { key: 'excellent', label: 'Excellent (90-100%)', min: 90, color: '#7affa9' },
  { key: 'bien',      label: 'Bien (70-89%)',       min: 70, color: '#58d5d5' },
  { key: 'moyen',     label: 'Moyen (40-69%)',      min: 40, color: '#ecd987' },
  { key: 'renforcer', label: 'À renforcer (<40%)',  min: 0,  color: '#ff79c9' },
] as const

function getLevel(score: number | null): number {
  if (score === null) return -1
  if (score >= 90) return 0
  if (score >= 70) return 1
  if (score >= 40) return 2
  return 3
}

const CAT_ERR_KEY: Record<CategoryKey, keyof CorrectionRead> = {
  conjugaison: 'err_conjugaison',
  homophone:   'err_homophone',
  accord:      'err_accord',
  majuscule:   'err_majuscule',
  ponctuation: 'err_ponctuation',
  infinitif:   'err_infinitif',
  orthographe: 'err_orthographe',
  nonPresent:  'err_non_present',
  son:         'err_son',
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ title, value, sub, iconBg, icon }: {
  title: string
  value: string | number
  sub: string
  iconBg: string
  icon: React.ReactNode
}) {
  return (
    <div className="bg-white border border-black/10 rounded-[14px] flex-1 min-w-0 overflow-hidden">
      <div className="flex items-center justify-between px-6 pt-5">
        <span className="text-[14px] font-medium text-[#4a5565]">{title}</span>
        <div className="size-9 rounded-[10px] flex items-center justify-center shrink-0" style={{ background: iconBg }}>
          {icon}
        </div>
      </div>
      <div className="flex flex-col gap-1 px-6 pt-3 pb-5">
        <span className="text-[24px] font-semibold text-[#101828] leading-8">{value}</span>
        <span className="text-[12px] text-[#6a7282]">{sub}</span>
      </div>
    </div>
  )
}

function InsightCard({ icon, iconBg, title, children }: {
  icon: React.ReactNode
  iconBg: string
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white border border-[#e5e7eb] rounded-[10px] flex gap-3 p-4 flex-1 min-w-0">
      <div className="size-10 rounded-full flex items-center justify-center shrink-0" style={{ background: iconBg }}>
        {icon}
      </div>
      <div className="flex flex-col gap-1 min-w-0">
        <p className="text-[14px] font-medium text-[#101828]">{title}</p>
        <div className="text-[12px] text-[#4a5565] leading-4">{children}</div>
      </div>
    </div>
  )
}

// ── Radar Chart (9 axes CHAMPION) ──────────────────────────────────────────────

function RadarChart({ values }: { values: Record<CategoryKey, number> }) {
  const SIZE = 280
  const CX = SIZE / 2
  const CY = SIZE / 2
  const R = 90
  const n = CATEGORIES.length

  function polar(angle: number, r: number) {
    const rad = (angle - 90) * (Math.PI / 180)
    return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) }
  }

  const angles = CATEGORIES.map((_, i) => (i * 360) / n)

  const gridLevels = [0.25, 0.5, 0.75, 1]
  const maxVal = Math.max(...Object.values(values), 1)
  const normalized = CATEGORIES.map(cat => values[cat.key] / maxVal)

  const dataPoints = CATEGORIES.map((_, i) => polar(angles[i], (1 - normalized[i]) * R))
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z'

  return (
    <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="mx-auto">
      {gridLevels.map(level => {
        const pts = angles.map(a => polar(a, R * level))
        const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z'
        return <path key={level} d={path} fill="none" stroke="#e5e7eb" strokeWidth="1" />
      })}
      {angles.map((angle, i) => {
        const pt = polar(angle, R)
        return <line key={i} x1={CX} y1={CY} x2={pt.x.toFixed(1)} y2={pt.y.toFixed(1)} stroke="#e5e7eb" strokeWidth="1" />
      })}
      <path d={dataPath} fill="rgba(255,55,187,0.15)" stroke="#ff37bb" strokeWidth="1.5" />
      {CATEGORIES.map((cat, i) => {
        const labelR = R + 18
        const pt = polar(angles[i], labelR)
        return (
          <text
            key={cat.key}
            x={pt.x.toFixed(1)}
            y={pt.y.toFixed(1)}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="11"
            fill="#666"
            fontFamily="Inter, system-ui, sans-serif"
          >
            {cat.letter}
          </text>
        )
      })}
    </svg>
  )
}

// ── Line Chart (évolution) ────────────────────────────────────────────────────

interface DicteeData {
  label: string
  counts: [number, number, number, number]
}

function EvolutionChart({ data }: { data: DicteeData[] }) {
  const W = 500, H = 220
  const PAD = { top: 12, right: 12, bottom: 40, left: 30 }
  const chartW = W - PAD.left - PAD.right
  const chartH = H - PAD.top - PAD.bottom

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[220px] text-[12px] text-[#9ca3af]">
        Pas encore de données
      </div>
    )
  }

  const maxCount = Math.max(...data.flatMap(m => m.counts), 1)

  function xPos(i: number) {
    return PAD.left + (i / Math.max(data.length - 1, 1)) * chartW
  }
  function yPos(v: number) {
    return PAD.top + chartH - (v / maxCount) * chartH
  }

  const lines = LEVEL_CONFIG.map((lvl, li) => ({
    color: lvl.color,
    label: lvl.label.split(' ')[0],
    points: data.map((m, i) => ({ x: xPos(i), y: yPos(m.counts[li]) })),
  }))

  const yTicks = [0, Math.round(maxCount / 2), maxCount]

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      {yTicks.map(tick => (
        <g key={tick}>
          <line
            x1={PAD.left} y1={yPos(tick).toFixed(1)}
            x2={PAD.left + chartW} y2={yPos(tick).toFixed(1)}
            stroke="#f3f4f6" strokeWidth="1"
          />
          <text x={PAD.left - 4} y={yPos(tick).toFixed(1)} textAnchor="end" dominantBaseline="middle" fontSize="10" fill="#6b7280">
            {tick}
          </text>
        </g>
      ))}
      {data.map((m, i) => (
        <text
          key={i}
          x={xPos(i).toFixed(1)}
          y={(PAD.top + chartH + 14).toFixed(1)}
          textAnchor="middle"
          fontSize="10"
          fill="#6b7280"
        >
          {m.label}
        </text>
      ))}
      {lines.map(line => {
        const path = line.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
        return (
          <g key={line.label}>
            <path d={path} fill="none" stroke={line.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
            {line.points.map((p, i) => (
              <circle key={i} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r="3" fill={line.color} />
            ))}
          </g>
        )
      })}
    </svg>
  )
}

// ── Level Bars ────────────────────────────────────────────────────────────────

function LevelBars({ counts, total }: { counts: number[]; total: number }) {
  return (
    <div className="flex flex-col gap-4 w-full">
      {LEVEL_CONFIG.map((lvl, i) => {
        const pct = total > 0 ? Math.round((counts[i] / total) * 100) : 0
        return (
          <div key={lvl.key} className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-3 rounded-full shrink-0" style={{ background: lvl.color }} />
                <span className="text-[14px] font-medium text-[#101828]">{lvl.label}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[14px] text-[#4a5565]">{counts[i]} élève{counts[i] !== 1 ? 's' : ''}</span>
                <span className="text-[18px] font-semibold text-[#101828] w-12 text-right">{pct}%</span>
              </div>
            </div>
            <div className="bg-[#f3f4f6] h-3 rounded-full overflow-hidden">
              <div
                className="h-3 rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, background: lvl.color }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── CHAMPION Bars ─────────────────────────────────────────────────────────────

function ChampionBars({ errorsPerCat, totalCorrsByLevel }: { errorsPerCat: Record<CategoryKey, number>; totalCorrsByLevel: number }) {
  const maxErr = Math.max(...Object.values(errorsPerCat), 1)
  const catColors = ['#0091ad', '#6efafb', '#ff57bb', '#f7e8a4', '#e0cb69', '#56bace', '#ab347b', '#43afb0', '#d5bc4c']

  return (
    <div className="flex flex-col gap-4">
      {CATEGORIES.map((cat, i) => {
        const count = errorsPerCat[cat.key] ?? 0
        const avg = totalCorrsByLevel > 0 ? (count / totalCorrsByLevel).toFixed(1) : '0.0'
        const pct = (count / maxErr) * 100
        return (
          <div key={cat.key} className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="size-12 rounded-[10px] flex items-center justify-center shrink-0"
                  style={{ background: catColors[i] }}
                >
                  <span className="text-white font-bold text-[16px]">{cat.letter}</span>
                </div>
                <div>
                  <p className="text-[14px] font-medium text-[#101828]">{cat.label}</p>
                  <p className="text-[12px] text-[#6a7282]">Moyenne : {avg} erreurs/dictée</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[24px] font-semibold text-[#101828]">{count}</p>
                <p className="text-[12px] text-[#6a7282]">erreurs totales</p>
              </div>
            </div>
            <div className="bg-[#f3f4f6] h-2.5 rounded-full overflow-hidden">
              <div
                className="h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, background: catColors[i] }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function ClasseStats() {
  const { classeId } = useParams<{ classeId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const nomFromState: string | undefined = location.state?.nom

  const [classe, setClasse] = useState<ClasseApi | null>(null)
  const [stats, setStats] = useState<ClasseStats | null>(null)
  const [corrections, setCorrections] = useState<CorrectionRead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!classeId) return
    const id = Number(classeId)
    setLoading(true)
    Promise.all([
      getClasse(id),
      getClasseStats(id),
      getCorrections(),
    ]).then(([cls, st, corrs]) => {
      setClasse(cls)
      setStats(st)
      setCorrections(corrs)
    }).catch(console.error).finally(() => setLoading(false))
  }, [classeId])

  // Derived stats
  const eleveIds = useMemo(
    () => new Set(stats?.eleves.map(e => e.id) ?? []),
    [stats]
  )

  // Corrections belonging to this class (via eleve_id)
  const classeCorrections = useMemo(
    () => corrections.filter(c => c.eleve_id != null && eleveIds.has(c.eleve_id)),
    [corrections, eleveIds]
  )

  // One most-recent correction per eleve
  const latestByEleve = useMemo(() => {
    const map = new Map<number, CorrectionRead>()
    for (const c of classeCorrections) {
      if (c.eleve_id == null) continue
      const existing = map.get(c.eleve_id)
      if (!existing || c.created_at > existing.created_at) {
        map.set(c.eleve_id, c)
      }
    }
    return map
  }, [classeCorrections])

  // Level distribution from eleves.moyenne
  const levelCounts = useMemo(() => {
    const counts = [0, 0, 0, 0]
    for (const eleve of stats?.eleves ?? []) {
      const lvl = getLevel(eleve.moyenne)
      if (lvl >= 0) counts[lvl]++
    }
    return counts
  }, [stats])

  const totalWithMoyenne = useMemo(
    () => (stats?.eleves ?? []).filter(e => e.moyenne !== null).length,
    [stats]
  )

  // Elèves excellents (≥90%)
  const eleveExcellents = levelCounts[0]

  // Aggregated CHAMPION errors across all corrections for the class
  const errorsPerCat = useMemo(() => {
    const agg = Object.fromEntries(CATEGORIES.map(c => [c.key, 0])) as Record<CategoryKey, number>
    for (const corr of classeCorrections) {
      for (const cat of CATEGORIES) {
        const field = CAT_ERR_KEY[cat.key]
        agg[cat.key] += (corr[field] as number) ?? 0
      }
    }
    return agg
  }, [classeCorrections])

  // Evolution: group corrections by planification, one point per dictée
  const dicteeData = useMemo<DicteeData[]>(() => {
    const byPlanif = new Map<number, { date: string; eleveScores: Map<number, number[]> }>()
    for (const c of classeCorrections) {
      if (c.eleve_id == null || c.planification_id == null) continue
      if (!byPlanif.has(c.planification_id)) {
        byPlanif.set(c.planification_id, { date: c.created_at, eleveScores: new Map() })
      }
      const entry = byPlanif.get(c.planification_id)!
      const scores = entry.eleveScores.get(c.eleve_id) ?? []
      scores.push(c.score)
      entry.eleveScores.set(c.eleve_id, scores)
    }
    const MONTH_LABELS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
    return Array.from(byPlanif.entries())
      .sort(([, a], [, b]) => a.date.localeCompare(b.date))
      .map(([, entry]) => {
        const d = new Date(entry.date)
        const label = `${d.getDate()} ${MONTH_LABELS[d.getMonth()]}`
        const counts: [number, number, number, number] = [0, 0, 0, 0]
        for (const scores of entry.eleveScores.values()) {
          const avg = scores.reduce((a, b) => a + b, 0) / scores.length
          const lvl = getLevel(avg)
          if (lvl >= 0) counts[lvl]++
        }
        return { label, counts }
      })
  }, [classeCorrections])

  // Dominant difficulty (most errors category)
  const mainDifficulty = useMemo(() => {
    let maxCat = CATEGORIES[0]
    let maxVal = 0
    for (const cat of CATEGORIES) {
      if (errorsPerCat[cat.key] > maxVal) {
        maxVal = errorsPerCat[cat.key]
        maxCat = cat
      }
    }
    return maxVal > 0 ? maxCat : null
  }, [errorsPerCat])

  // Average trend across class
  const avgTrend = useMemo(() => {
    const trends = (stats?.eleves ?? []).filter(e => e.trend !== null).map(e => e.trend!)
    if (trends.length === 0) return null
    return Math.round(trends.reduce((a, b) => a + b, 0) / trends.length)
  }, [stats])

  const nom = classe?.nom ?? nomFromState ?? `Classe #${classeId}`
  const moyenneStr = stats?.moyenne_generale != null
    ? `${stats.moyenne_generale.toFixed(1)}%`
    : '—'

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-[#6a7282] text-[14px]">
        Chargement…
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between py-2 px-1">
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-[14px] text-[#6a7282] hover:text-[#0a0a0a] transition-colors w-fit"
          >
            <ChevronLeft size={16} />
            Retour aux Classes
          </button>
          <div>
            <h1 className="text-[24px] font-semibold text-[#101828] leading-9">Statistiques &amp; analyses</h1>
            <p className="text-[18px] font-medium text-[#ff9ad6]">Analyses approfondies et insights pédagogiques</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 items-end justify-center self-stretch">
          <div className="bg-white border border-black/10 rounded-[8px] px-4 h-9 flex items-center gap-2 text-[14px] font-medium text-[#0a0a0a]">
            {nom}
          </div>
        </div>
      </div>

      {/* 4 Stat cards */}
      <div className="flex gap-3">
        <StatCard
          title="Total élèves"
          value={stats?.total_eleves ?? 0}
          sub="élèves dans la classe"
          iconBg="#ffeef8"
          icon={<Users size={18} color="#ab347b" />}
        />
        <StatCard
          title="Moyenne générale"
          value={moyenneStr}
          sub="Performance de la classe"
          iconBg="#dcfce7"
          icon={<BarChart2 size={18} color="#016630" />}
        />
        <StatCard
          title="Total dictées"
          value={stats?.total_dictees_planifiees ?? 0}
          sub="Dictées planifiées"
          iconBg="#e2fefe"
          icon={<BookOpen size={18} color="#005768" />}
        />
        <StatCard
          title="Élèves Excellents"
          value={eleveExcellents}
          sub="≥ 90% de moyenne"
          iconBg="#fff4e4"
          icon={<Star size={18} color="#c9ae2e" />}
        />
      </div>

      {/* Insights Pédagogiques */}
      <div className="bg-white border border-black/10 rounded-[14px] p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2 px-2">
          <Lightbulb size={18} color="#0a0a0a" />
          <span className="text-[15px] font-medium text-[#0a0a0a]">Insights Pédagogiques</span>
        </div>
        <div className="flex gap-3">
          <InsightCard icon={<TrendingUp size={18} color="#016630" />} iconBg="#dcfce7" title="Progression Positive">
            {avgTrend !== null ? (
              <>
                La classe progresse de{' '}
                <span className="font-semibold text-[#00a63e]">
                  {avgTrend >= 0 ? '+' : ''}{avgTrend}%
                </span>{' '}
                depuis le début d'année
              </>
            ) : (
              'Pas encore de données de progression'
            )}
          </InsightCard>
          <InsightCard icon={<AlertTriangle size={18} color="#c9ae2e" />} iconBg="#fff4e4" title="Difficulté Principale">
            {mainDifficulty ? (
              <>
                Les erreurs de type{' '}
                <span className="font-semibold text-[#c9ae2e]">{mainDifficulty.letter}</span>
                {' '}sont les plus fréquentes
              </>
            ) : (
              <span>{"Aucune erreur détectée pour l’instant"}</span>
            )}
          </InsightCard>
          <InsightCard icon={<AlertTriangle size={18} color="#dc2626" />} iconBg="#fee2e2" title="Élèves en Difficulté">
            {stats && stats.eleves_en_difficulte > 0 ? (
              <>
                <span className="font-semibold text-[#dc2626]">
                  {stats.eleves_en_difficulte} élève{stats.eleves_en_difficulte > 1 ? 's' : ''}
                </span>{' '}
                {stats.eleves_en_difficulte > 1 ? 'ont' : 'a'} une moyenne inférieure à 40%
              </>
            ) : (
              <span className="text-[#16a34a] font-medium">Aucun élève en difficulté</span>
            )}
          </InsightCard>
        </div>
      </div>

      {/* Charts row 1: Évolution + Distribution niveaux */}
      <div className="flex gap-3">
        <div className="bg-white border border-black/10 rounded-[14px] p-6 flex-1 min-w-0">
          <p className="text-[15px] font-medium text-[#0a0a0a] mb-1">
            Évolution de la Distribution des Élèves par Niveau
          </p>
          <p className="text-[13px] text-[#6a7282] mb-4">
            Progression des groupes de performance
          </p>
          <EvolutionChart data={dicteeData} />
          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-3 justify-center">
            {LEVEL_CONFIG.map(lvl => (
              <div key={lvl.key} className="flex items-center gap-1.5">
                <div className="size-3 rounded-full shrink-0" style={{ background: lvl.color }} />
                <span className="text-[11px] text-[#4a5565]">{lvl.label.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-black/10 rounded-[14px] p-6 flex-1 min-w-0">
          <p className="text-[15px] font-medium text-[#0a0a0a] mb-1">
            Distribution des Niveaux de Réussite
          </p>
          <p className="text-[13px] text-[#6a7282] mb-6">
            Répartition des élèves par tranche de performance
          </p>
          <LevelBars counts={levelCounts} total={totalWithMoyenne} />
        </div>
      </div>

      {/* Charts row 2: Radar CHAMPION + Analyse détaillée */}
      <div className="flex gap-3">
        <div className="bg-white border border-black/10 rounded-[14px] p-6 flex-1 min-w-0">
          <p className="text-[15px] font-medium text-[#0a0a0a] mb-1">
            Profil de Compétences C.H.A.M.P.I.O.N
          </p>
          <p className="text-[13px] text-[#6a7282] mb-4">
            Distribution des erreurs par catégorie
          </p>
          <div className="flex justify-center py-2">
            <RadarChart values={errorsPerCat} />
          </div>
        </div>

        <div className="bg-white border border-black/10 rounded-[14px] p-6 flex-1 min-w-0">
          <p className="text-[15px] font-medium text-[#0a0a0a] mb-1">
            Analyse Détaillée des Codes d'Erreur
          </p>
          <p className="text-[13px] text-[#6a7282] mb-6">
            Répartition et fréquence des erreurs C.H.A.M.P.I.O.N
          </p>
          <div className="overflow-y-auto max-h-[380px] pr-2">
            <ChampionBars errorsPerCat={errorsPerCat} totalCorrsByLevel={classeCorrections.length} />
          </div>
        </div>
      </div>
    </div>
  )
}
