import { useState, useEffect, useMemo, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ChevronLeft, BarChart2, BookOpen, Clock, TrendingUp, TrendingDown, AlertTriangle, Lightbulb, ChevronDown } from 'lucide-react'
import { getCorrections } from '../../api/corrections'
import type { CorrectionRead } from '../../api/corrections'
import { getDictees } from '../../api/dictees'
import type { DicteeApi } from '../../api/dictees'
import { getClasseStats } from '../../api/classes'
import { CATEGORIES } from '../Correction/constants'
import type { CategoryKey } from '../Correction/constants'

// ── Category helpers ───────────────────────────────────────────────────────────

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

const CAT_COLORS = ['#0091ad','#6efafb','#ff57bb','#f7e8a4','#e0cb69','#56bace','#ab347b','#43afb0','#d5bc4c']

function scoreColor(score: number) {
  if (score >= 90) return '#16a34a'
  if (score >= 70) return '#0091ad'
  if (score >= 40) return '#c9ae2e'
  return '#dc2626'
}

function scoreLabel(score: number) {
  if (score >= 90) return 'Excellent !'
  if (score >= 70) return 'Bien'
  if (score >= 40) return 'Moyen'
  return 'À renforcer'
}

function relativeDate(dateStr: string | null) {
  if (!dateStr) return '—'
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
  if (diff === 0) return "Aujourd'hui"
  if (diff === 1) return 'Il y a 1 jour'
  if (diff < 30) return `Il y a ${diff} jours`
  if (diff < 365) return `Il y a ${Math.floor(diff / 30)} mois`
  return `Il y a ${Math.floor(diff / 365)} an${Math.floor(diff / 365) > 1 ? 's' : ''}`
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  const MONTHS = ['jan.','fév.','mar.','avr.','mai','juin','juil.','août','sep.','oct.','nov.','déc.']
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatCard({ title, value, sub, iconBg, icon }: {
  title: string; value: string | number; sub: string; iconBg: string; icon: React.ReactNode
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

// ── Radar Chart (élève + classe, même échelle) ─────────────────────────────────

function RadarChart({ values, classeValues }: { values: Record<CategoryKey, number>; classeValues?: Record<CategoryKey, number> }) {
  const SIZE = 280, CX = 140, CY = 140, R = 90
  const n = CATEGORIES.length
  function polar(angle: number, r: number) {
    const rad = (angle - 90) * (Math.PI / 180)
    return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) }
  }
  const angles = CATEGORIES.map((_, i) => (i * 360) / n)

  // Même max pour les deux datasets → échelle commune
  const maxVal = Math.max(
    ...Object.values(values),
    ...(classeValues ? Object.values(classeValues) : []),
    1
  )

  // Même convention que ClasseStats : (1 - normalized) * R
  // → centre = beaucoup d'erreurs, bord = peu d'erreurs
  function makePath(vals: Record<CategoryKey, number>) {
    const pts = CATEGORIES.map((cat, i) => {
      const normalized = vals[cat.key] / maxVal
      return polar(angles[i], (1 - normalized) * R)
    })
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z'
  }

  const elevePath = makePath(values)
  const classePath = classeValues ? makePath(classeValues) : null

  return (
    <div className="flex flex-col gap-3">
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="mx-auto">
        {[0.25, 0.5, 0.75, 1].map(level => {
          const pts = angles.map(a => polar(a, R * level))
          const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z'
          return <path key={`grid-${level}`} d={path} fill="none" stroke="#e5e7eb" strokeWidth="1" />
        })}
        {angles.map((angle, i) => {
          const pt = polar(angle, R)
          return <line key={`axis-${i}`} x1={CX} y1={CY} x2={pt.x.toFixed(1)} y2={pt.y.toFixed(1)} stroke="#e5e7eb" strokeWidth="1" />
        })}
        {classePath && (
          <path d={classePath} fill="rgba(156,163,175,0.12)" stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="4 2" />
        )}
        <path d={elevePath} fill="rgba(0,145,173,0.18)" stroke="#0091ad" strokeWidth="2" />
        {CATEGORIES.map((cat, i) => {
          const pt = polar(angles[i], R + 18)
          return (
            <text key={`label-${cat.key}`} x={pt.x.toFixed(1)} y={pt.y.toFixed(1)}
              textAnchor="middle" dominantBaseline="middle" fontSize="11" fill="#666"
              fontFamily="Inter, system-ui, sans-serif">
              {cat.letter}
            </text>
          )
        })}
      </svg>
      <div className="flex items-center justify-center gap-6 text-[11px] text-[#4a5565]">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-0.5 rounded" style={{ background: '#0091ad' }} />
          <span>Élève</span>
        </div>
        {classePath && (
          <div className="flex items-center gap-1.5">
            <svg width="20" height="2"><line x1="0" y1="1" x2="20" y2="1" stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="4 2" /></svg>
            <span>Classe</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Errors Evolution Chart (per dictée, 9 lines) ───────────────────────────────

interface DicteePoint {
  label: string
  errors: number[]
}

function ErrorEvolutionChart({ points, filteredCats }: { points: DicteePoint[]; filteredCats: number[] }) {
  const W = 500, H = 240
  const PAD = { top: 12, right: 12, bottom: 40, left: 36 }
  const chartW = W - PAD.left - PAD.right
  const chartH = H - PAD.top - PAD.bottom

  if (points.length === 0) {
    return <div className="flex items-center justify-center h-[240px] text-[12px] text-[#9ca3af]">Pas encore de données</div>
  }

  const maxErr = Math.max(...points.flatMap(p => filteredCats.map(ci => p.errors[ci])), 1)

  function xPos(i: number) { return PAD.left + (i / Math.max(points.length - 1, 1)) * chartW }
  function yPos(v: number) { return PAD.top + chartH - (v / maxErr) * chartH }

  const yTicks = [...new Set([0, Math.round(maxErr / 2), maxErr])]

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      {yTicks.map(tick => (
        <g key={`ytick-${tick}`}>
          <line x1={PAD.left} y1={yPos(tick)} x2={PAD.left + chartW} y2={yPos(tick)} stroke="#f3f4f6" strokeWidth="1" />
          <text x={PAD.left - 4} y={yPos(tick)} textAnchor="end" dominantBaseline="middle" fontSize="10" fill="#6b7280">{tick}</text>
        </g>
      ))}
      <text x={PAD.left - 24} y={PAD.top + chartH / 2} textAnchor="middle" fontSize="10" fill="#9ca3af"
        transform={`rotate(-90, ${PAD.left - 24}, ${PAD.top + chartH / 2})`}>Erreurs</text>
      {points.map((p, i) => (
        <text key={`xlabel-${i}`} x={xPos(i)} y={PAD.top + chartH + 14} textAnchor="middle" fontSize="9" fill="#6b7280">{p.label}</text>
      ))}
      {filteredCats.map(ci => {
        const color = CAT_COLORS[ci]
        const pts = points.map((p, i) => ({ x: xPos(i), y: yPos(p.errors[ci]) }))
        const path = pts.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(' ')
        return (
          <g key={`line-${ci}`}>
            <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
            {pts.map((pt, i) => <circle key={`dot-${ci}-${i}`} cx={pt.x.toFixed(1)} cy={pt.y.toFixed(1)} r="2.5" fill={color} />)}
          </g>
        )
      })}
    </svg>
  )
}

// ── CHAMPION Bars ──────────────────────────────────────────────────────────────

function ChampionBars({ errorsPerCat, totalCorrections }: { errorsPerCat: Record<CategoryKey, number>; totalCorrections: number }) {
  const maxErr = Math.max(...Object.values(errorsPerCat), 1)
  const totalErr = Object.values(errorsPerCat).reduce((a, b) => a + b, 0)

  return (
    <div className="flex flex-col gap-4">
      {CATEGORIES.map((cat, i) => {
        const count = errorsPerCat[cat.key] ?? 0
        const avg = totalCorrections > 0 ? (count / totalCorrections).toFixed(1) : '0.0'
        const pct = totalErr > 0 ? Math.round((count / totalErr) * 100) : 0
        const barPct = (count / maxErr) * 100
        return (
          <div key={cat.key} className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-[10px] flex items-center justify-center shrink-0" style={{ background: CAT_COLORS[i] }}>
                  <span className="text-white font-bold text-[15px]">{cat.letter}</span>
                </div>
                <div>
                  <p className="text-[14px] font-medium text-[#101828]">{cat.label}</p>
                  <p className="text-[12px] text-[#6a7282]">{avg} erreurs/dictée en moyenne</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[24px] font-semibold text-[#101828]">{count}</p>
                <p className="text-[12px] text-[#6a7282]">{pct}% du total</p>
              </div>
            </div>
            <div className="bg-[#f3f4f6] h-2.5 rounded-full overflow-hidden">
              <div className="h-2.5 rounded-full transition-all duration-500" style={{ width: `${barPct}%`, background: CAT_COLORS[i] }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function EleveStats() {
  const { eleveId } = useParams<{ eleveId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as {
    nom?: string
    dispositif?: string | null
    classeNom?: string
    classeId?: number
    eleve?: { moyenne?: number | null; trend?: number | null; derniere_dictee_score?: number | null; derniere_date?: string | null }
  } | null

  const nom = state?.nom ?? `Élève #${eleveId}`
  const dispositif = state?.dispositif ?? null
  const classeNom = state?.classeNom ?? ''
  const classeId = state?.classeId ?? null

  const [corrections, setCorrections] = useState<CorrectionRead[]>([])
  const [dictees, setDictees] = useState<DicteeApi[]>([])
  const [classeEleveIds, setClasseEleveIds] = useState<Set<number>>(new Set())
  const [allCorrections, setAllCorrections] = useState<CorrectionRead[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCatIdx, setSelectedCatIdx] = useState<number | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    if (!eleveId) return
    setLoading(true)
    const promises: Promise<unknown>[] = [getCorrections(), getDictees()]
    if (classeId) promises.push(getClasseStats(classeId))
    Promise.all(promises)
      .then(([corrs, dicts, classeStats]) => {
        const allCorrs = corrs as CorrectionRead[]
        setAllCorrections(allCorrs)
        setCorrections(allCorrs.filter(c => c.eleve_id === Number(eleveId)).sort((a, b) => a.created_at.localeCompare(b.created_at)))
        setDictees(dicts as DicteeApi[])
        if (classeStats) {
          const ids = new Set((classeStats as { eleves: { id: number }[] }).eleves.map((e) => e.id))
          setClasseEleveIds(ids)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [eleveId, classeId])

  const dicteeMap = useMemo(() => new Map(dictees.map(d => [d.id, d])), [dictees])

  // Stat card values
  const moyenne = useMemo(() => {
    if (corrections.length === 0) return null
    return Math.round(corrections.reduce((s, c) => s + c.score, 0) / corrections.length)
  }, [corrections])

  const derniereCorrection = corrections.length > 0 ? corrections[corrections.length - 1] : null

  // Trend: compare last 3 vs first 3 averages
  const trend = useMemo(() => {
    if (corrections.length < 2) return null
    const n = Math.min(3, Math.floor(corrections.length / 2))
    const first = corrections.slice(0, n).reduce((s, c) => s + c.score, 0) / n
    const last = corrections.slice(-n).reduce((s, c) => s + c.score, 0) / n
    return Math.round(last - first)
  }, [corrections])

  // Errors per category
  const errorsPerCat = useMemo(() => {
    const agg = Object.fromEntries(CATEGORIES.map(c => [c.key, 0])) as Record<CategoryKey, number>
    for (const corr of corrections) {
      for (const cat of CATEGORIES) {
        agg[cat.key] += (corr[CAT_ERR_KEY[cat.key]] as number) ?? 0
      }
    }
    return agg
  }, [corrections])

  const mainWeakness = useMemo(() => {
    let max = -1, cat: (typeof CATEGORIES)[number] = CATEGORIES[0]
    for (const c of CATEGORIES) {
      if (errorsPerCat[c.key] > max) { max = errorsPerCat[c.key]; cat = c }
    }
    return max > 0 ? cat : null
  }, [errorsPerCat])

  const mainStrength = useMemo(() => {
    let min = Infinity, cat: (typeof CATEGORIES)[number] = CATEGORIES[0]
    for (const c of CATEGORIES) {
      if (errorsPerCat[c.key] < min) { min = errorsPerCat[c.key]; cat = c }
    }
    return corrections.length > 0 ? cat : null
  }, [errorsPerCat, corrections])

  // Moyenne d'erreurs par correction pour l'élève (même unité que la classe)
  const eleveAvgErrorsPerCat = useMemo<Record<CategoryKey, number>>(() => {
    if (corrections.length === 0) return Object.fromEntries(CATEGORIES.map(c => [c.key, 0])) as Record<CategoryKey, number>
    return Object.fromEntries(
      CATEGORIES.map(cat => [cat.key, errorsPerCat[cat.key] / corrections.length])
    ) as Record<CategoryKey, number>
  }, [errorsPerCat, corrections.length])

  // Moyenne d'erreurs par correction pour la classe (même unité)
  const classeErrorsPerCat = useMemo<Record<CategoryKey, number> | undefined>(() => {
    if (classeEleveIds.size === 0) return undefined
    const classeCorrs = allCorrections.filter(c => c.eleve_id != null && classeEleveIds.has(c.eleve_id))
    if (classeCorrs.length === 0) return undefined
    const agg = Object.fromEntries(CATEGORIES.map(c => [c.key, 0])) as Record<CategoryKey, number>
    for (const corr of classeCorrs) {
      for (const cat of CATEGORIES) {
        agg[cat.key] += (corr[CAT_ERR_KEY[cat.key]] as number) ?? 0
      }
    }
    for (const cat of CATEGORIES) agg[cat.key] = agg[cat.key] / classeCorrs.length
    return agg
  }, [classeEleveIds, allCorrections])

  // Per-dictée evolution points
  const evolutionPoints = useMemo<DicteePoint[]>(() =>
    corrections.map(c => ({
      label: formatDate(c.created_at).split(' ').slice(0, 2).join(' '),
      errors: CATEGORIES.map(cat => (c[CAT_ERR_KEY[cat.key]] as number) ?? 0),
    }))
  , [corrections])

  const allCatIndexes = CATEGORIES.map((_, i) => i)
  const filteredCatIndexes = selectedCatIdx !== null ? [selectedCatIdx] : allCatIndexes

  const derniereDate = derniereCorrection?.created_at ?? null

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-[#6a7282] text-[14px]">Chargement…</div>
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between py-2 px-1">
        <div className="flex flex-col gap-2">
          <button type="button" onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-[14px] text-[#6a7282] hover:text-[#0a0a0a] transition-colors w-fit">
            <ChevronLeft size={16} />
            {classeNom ? `Retour à ${classeNom}` : 'Retour'}
          </button>
          <div>
            <h1 className="text-[24px] font-semibold text-[#101828] leading-9">{nom}</h1>
            <p className="text-[18px] font-medium text-[#ff9ad6]">Statistiques individuelles &amp; suivi détaillé</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 self-stretch justify-center">
          {dispositif && (
            <span className="text-[13px] text-[#6a7282] bg-[#f3f4f6] px-3 py-1 rounded-full">
              Dispositif : {dispositif}
            </span>
          )}
          {classeNom && (
            <span className="text-[13px] font-medium text-[#0a0a0a] bg-white border border-black/10 px-3 py-1 rounded-[8px]">
              {classeNom}
            </span>
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div className="flex gap-3">
        <StatCard
          title="Moyenne Générale"
          value={moyenne !== null ? `${moyenne}%` : '—'}
          sub={trend !== null ? `${trend >= 0 ? '+' : ''}${trend}% récemment` : 'Pas encore de données'}
          iconBg="#dcfce7"
          icon={<BarChart2 size={18} color="#016630" />}
        />
        <StatCard
          title="Dernière Note"
          value={derniereCorrection ? `${derniereCorrection.score}%` : '—'}
          sub={derniereCorrection ? scoreLabel(derniereCorrection.score) : '—'}
          iconBg="#e2fefe"
          icon={<BookOpen size={18} color="#005768" />}
        />
        <StatCard
          title="Total Dictées"
          value={corrections.length}
          sub="Réalisées cette année"
          iconBg="#ffeef8"
          icon={<BookOpen size={18} color="#ab347b" />}
        />
        <StatCard
          title="Dernière Activité"
          value={relativeDate(derniereDate)}
          sub={classeNom || '—'}
          iconBg="#fff4e4"
          icon={<Clock size={18} color="#c9ae2e" />}
        />
      </div>

      {/* Analyse Individuelle */}
      <div className="bg-white border border-black/10 rounded-[14px] p-6">
        <div className="flex items-center gap-2 mb-1">
          <Lightbulb size={18} color="#0a0a0a" />
          <span className="text-[15px] font-medium text-[#0a0a0a]">Analyse Individuelle</span>
        </div>
        <p className="text-[13px] text-[#6a7282] mb-4">Insights automatiques basés sur les dernières performances</p>
        <div className="flex gap-4">
          {/* Tendance */}
          <div className="flex-1 flex items-start gap-3 bg-[#fafafa] rounded-[10px] p-4">
            <div className="size-10 rounded-full flex items-center justify-center shrink-0"
              style={{ background: trend !== null && trend >= 0 ? '#dcfce7' : '#fee2e2' }}>
              {trend !== null && trend >= 0
                ? <TrendingUp size={20} color="#016630" />
                : <TrendingDown size={20} color="#dc2626" />}
            </div>
            <div>
              <p className="text-[14px] font-medium text-[#101828]">Tendance</p>
              <p className="text-[12px] text-[#4a5565] leading-4 mt-0.5">
                {trend !== null
                  ? trend >= 0
                    ? `Progression de +${trend}% sur les dernières dictées`
                    : `Légère baisse de ${trend}% sur les dernières dictées`
                  : 'Pas encore assez de données'}
              </p>
            </div>
          </div>
          {/* Point d'attention */}
          <div className="flex-1 flex items-start gap-3 bg-[#fafafa] rounded-[10px] p-4">
            <div className="size-10 rounded-full flex items-center justify-center shrink-0 bg-[#fff4e4]">
              <AlertTriangle size={20} color="#c9ae2e" />
            </div>
            <div>
              <p className="text-[14px] font-medium text-[#101828]">Point d&apos;Attention</p>
              <p className="text-[12px] text-[#4a5565] leading-4 mt-0.5">
                {mainWeakness
                  ? `${mainWeakness.letter} (${mainWeakness.label}) — ${errorsPerCat[mainWeakness.key]} erreurs`
                  : 'Aucune erreur détectée'}
              </p>
            </div>
          </div>
          {/* Point fort */}
          <div className="flex-1 flex items-start gap-3 bg-[#fafafa] rounded-[10px] p-4">
            <div className="size-10 rounded-full flex items-center justify-center shrink-0 bg-[#e2fefe]">
              <TrendingUp size={20} color="#005768" />
            </div>
            <div>
              <p className="text-[14px] font-medium text-[#101828]">Point Fort</p>
              <p className="text-[12px] text-[#4a5565] leading-4 mt-0.5">
                {mainStrength
                  ? `${mainStrength.letter} (${mainStrength.label}) bien maîtrisé`
                  : 'Pas encore de données'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="flex gap-3">
        {/* Évolution des Erreurs */}
        <div className="bg-white border border-black/10 rounded-[14px] p-6 flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="text-[15px] font-medium text-[#0a0a0a]">Évolution des Erreurs par Type</p>
              <p className="text-[13px] text-[#6a7282] mt-1 mb-4">Suivi des erreurs C.H.A.M.P.I.O.N dans le temps</p>
            </div>
            <div ref={dropdownRef} className="relative shrink-0">
              <button
                type="button"
                onClick={() => setDropdownOpen(v => !v)}
                className="flex items-center gap-1.5 text-[13px] font-medium text-[#4a5565] bg-[#f3f4f6] hover:bg-[#e5e7eb] px-3 py-1.5 rounded-[8px] transition-colors"
              >
                {selectedCatIdx !== null
                  ? <><span className="size-2.5 rounded-sm inline-block mr-1" style={{ background: CAT_COLORS[selectedCatIdx] }} />{CATEGORIES[selectedCatIdx].letter} — {CATEGORIES[selectedCatIdx].label}</>
                  : 'Toutes'}
                <ChevronDown size={13} />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-[#e5e7eb] rounded-[10px] shadow-lg z-20 min-w-[200px] py-1 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => { setSelectedCatIdx(null); setDropdownOpen(false) }}
                    className={`w-full text-left px-4 py-2 text-[13px] hover:bg-[#f3f4f6] transition-colors ${selectedCatIdx === null ? 'font-semibold text-[#0a0a0a]' : 'text-[#4a5565]'}`}
                  >
                    Toutes les catégories
                  </button>
                  <div className="border-t border-[#f3f4f6] my-1" />
                  {CATEGORIES.map((cat, i) => (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => { setSelectedCatIdx(i); setDropdownOpen(false) }}
                      className={`w-full text-left px-4 py-2 text-[13px] flex items-center gap-2.5 hover:bg-[#f3f4f6] transition-colors ${selectedCatIdx === i ? 'font-semibold text-[#0a0a0a]' : 'text-[#4a5565]'}`}
                    >
                      <span className="size-2.5 rounded-sm shrink-0" style={{ background: CAT_COLORS[i] }} />
                      {cat.letter} — {cat.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <ErrorEvolutionChart points={evolutionPoints} filteredCats={filteredCatIndexes} />
          {/* Legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 justify-center">
            {CATEGORIES.map((cat, i) => (
              <div key={cat.key} className="flex items-center gap-1.5">
                <div className="size-3 rounded-sm shrink-0" style={{ background: CAT_COLORS[i] }} />
                <span className="text-[11px] text-[#4a5565]">{cat.letter} — {cat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Radar CHAMPION */}
        <div className="bg-white border border-black/10 rounded-[14px] p-6 flex-1 min-w-0">
          <p className="text-[15px] font-medium text-[#0a0a0a] mb-1">Profil de Compétences C.H.A.M.P.I.O.N</p>
          <p className="text-[13px] text-[#6a7282] mb-4">Forces et faiblesses par catégorie</p>
          <div className="flex justify-center py-2">
            <RadarChart values={eleveAvgErrorsPerCat} classeValues={classeErrorsPerCat} />
          </div>
        </div>
      </div>

      {/* Analyse Détaillée des Erreurs */}
      <div className="bg-white border border-black/10 rounded-[14px] p-6">
        <p className="text-[15px] font-medium text-[#0a0a0a] mb-1">Analyse Détaillée des Erreurs C.H.A.M.P.I.O.N</p>
        <p className="text-[13px] text-[#6a7282] mb-6">Répartition des erreurs par code</p>
        <ChampionBars errorsPerCat={errorsPerCat} totalCorrections={corrections.length} />
      </div>

      {/* Historique des Dictées */}
      <div className="bg-white border border-black/10 rounded-[14px] overflow-hidden">
        <div className="px-6 pt-6 pb-4">
          <p className="text-[15px] font-medium text-[#0a0a0a]">Historique des Dictées</p>
          <p className="text-[13px] text-[#6a7282] mt-1">Détail de toutes les dictées réalisées</p>
        </div>
        {corrections.length === 0 ? (
          <div className="px-6 pb-6 text-[14px] text-[#9ca3af]">Aucune correction enregistrée</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-t border-[#f3f4f6] bg-[#fafafa]">
                <th className="px-6 py-3 text-[12px] font-medium text-[#6a7282] uppercase tracking-wider">Titre</th>
                <th className="px-6 py-3 text-[12px] font-medium text-[#6a7282] uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-[12px] font-medium text-[#6a7282] uppercase tracking-wider">Note</th>
                <th className="px-6 py-3 text-[12px] font-medium text-[#6a7282] uppercase tracking-wider">Total Erreurs</th>
              </tr>
            </thead>
            <tbody>
              {[...corrections].reverse().map(corr => {
                const dictee = dicteeMap.get(corr.dictee_id)
                return (
                  <tr key={corr.id} className="border-t border-[#f3f4f6] hover:bg-[#fafafa]">
                    <td className="px-6 py-4 text-[14px] font-medium text-[#101828]">
                      {dictee?.titre ?? `Dictée #${corr.dictee_id}`}
                    </td>
                    <td className="px-6 py-4 text-[14px] text-[#4a5565]">
                      {formatDate(corr.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[13px] font-semibold"
                        style={{
                          background: scoreColor(corr.score) + '22',
                          color: scoreColor(corr.score),
                        }}
                      >
                        {corr.score}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[14px] text-[#101828]">{corr.nb_errors}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
