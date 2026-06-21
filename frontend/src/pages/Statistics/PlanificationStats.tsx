import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ChevronLeft, BarChart2, Users, CheckCircle, AlertTriangle, Award, TrendingUp, TrendingDown } from 'lucide-react'
import { getCorrections } from '../../api/corrections'
import type { CorrectionRead } from '../../api/corrections'
import { CATEGORIES } from '../Correction/constants'
import type { CategoryKey } from '../Correction/constants'

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

function formatDatePrevue(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  const MONTHS = ['jan.','fév.','mar.','avr.','mai','juin','juil.','août','sep.','oct.','nov.','déc.']
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

// ── StatCard ───────────────────────────────────────────────────────────────────

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

// ── Radar Chart ────────────────────────────────────────────────────────────────

function RadarChart({ values }: { values: Record<CategoryKey, number> }) {
  const SIZE = 280, CX = 140, CY = 140, R = 90
  const n = CATEGORIES.length
  function polar(angle: number, r: number) {
    const rad = (angle - 90) * (Math.PI / 180)
    return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) }
  }
  const angles = CATEGORIES.map((_, i) => (i * 360) / n)
  const maxVal = Math.max(...Object.values(values), 1)

  const pts = CATEGORIES.map((cat, i) => {
    const normalized = values[cat.key] / maxVal
    return polar(angles[i], (1 - normalized) * R)
  })
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z'

  return (
    <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="mx-auto">
      {[0.25, 0.5, 0.75, 1].map(level => {
        const gridPts = angles.map(a => polar(a, R * level))
        const gridPath = gridPts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z'
        return <path key={`grid-${level}`} d={gridPath} fill="none" stroke="#e5e7eb" strokeWidth="1" />
      })}
      {angles.map((angle, i) => {
        const pt = polar(angle, R)
        return <line key={`axis-${i}`} x1={CX} y1={CY} x2={pt.x.toFixed(1)} y2={pt.y.toFixed(1)} stroke="#e5e7eb" strokeWidth="1" />
      })}
      <path d={path} fill="rgba(255,87,187,0.18)" stroke="#ff57bb" strokeWidth="2" />
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
  )
}

// ── Score Histogram ────────────────────────────────────────────────────────────

const SCORE_BINS = [
  { label: '0–20',   min: 0,  max: 20,  color: '#dc2626' },
  { label: '20–40',  min: 20, max: 40,  color: '#c9ae2e' },
  { label: '40–60',  min: 40, max: 60,  color: '#f59e0b' },
  { label: '60–80',  min: 60, max: 80,  color: '#0091ad' },
  { label: '80–100', min: 80, max: 101, color: '#16a34a' },
]

function ScoreHistogram({ corrections }: { corrections: CorrectionRead[] }) {
  const W = 400, H = 220
  const PAD = { top: 20, right: 16, bottom: 48, left: 36 }
  const chartW = W - PAD.left - PAD.right
  const chartH = H - PAD.top - PAD.bottom
  const binGap = 10
  const barW = (chartW - binGap * (SCORE_BINS.length - 1)) / SCORE_BINS.length

  if (corrections.length === 0) {
    return <div className="flex items-center justify-center h-[220px] text-[12px] text-[#9ca3af]">Pas encore de données</div>
  }

  const counts = SCORE_BINS.map(bin =>
    corrections.filter(c => c.score >= bin.min && c.score < bin.max).length
  )
  const maxCount = Math.max(...counts, 1)

  function barX(i: number) { return PAD.left + i * (barW + binGap) }
  function barH(count: number) { return (count / maxCount) * chartH }
  function barY(count: number) { return PAD.top + chartH - barH(count) }

  const yTicks = Array.from({ length: maxCount + 1 }, (_, i) => i).filter(
    v => v === 0 || v === maxCount || (maxCount > 4 && v === Math.round(maxCount / 2))
  )

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      {yTicks.map(tick => {
        const y = PAD.top + chartH - (tick / maxCount) * chartH
        return (
          <g key={`ytick-${tick}`}>
            <line x1={PAD.left} y1={y} x2={PAD.left + chartW} y2={y} stroke="#f3f4f6" strokeWidth="1" />
            <text x={PAD.left - 4} y={y} textAnchor="end" dominantBaseline="middle" fontSize="10" fill="#6b7280">{tick}</text>
          </g>
        )
      })}
      <text x={PAD.left - 28} y={PAD.top + chartH / 2} textAnchor="middle" fontSize="10" fill="#9ca3af"
        transform={`rotate(-90, ${PAD.left - 28}, ${PAD.top + chartH / 2})`}>Élèves</text>
      {SCORE_BINS.map((bin, i) => (
        <g key={`bar-${i}`}>
          <rect x={barX(i)} y={barY(counts[i])} width={barW} height={Math.max(barH(counts[i]), 0)}
            fill={bin.color} rx={4} fillOpacity={0.85} />
          {counts[i] > 0 && (
            <text x={barX(i) + barW / 2} y={barY(counts[i]) - 5}
              textAnchor="middle" fontSize="11" fontWeight="600" fill={bin.color}>{counts[i]}</text>
          )}
          <text x={barX(i) + barW / 2} y={PAD.top + chartH + 14}
            textAnchor="middle" fontSize="10" fill="#6b7280">{bin.label}</text>
        </g>
      ))}
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
                  <p className="text-[12px] text-[#6a7282]">{avg} erreurs/élève en moyenne</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[24px] font-semibold text-[#101828]">{count}</p>
                <p className="text-[12px] text-[#6a7282]">{pct}% du total</p>
              </div>
            </div>
            <div className="bg-[#f3f4f6] h-2.5 rounded-full overflow-hidden">
              <div className="h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${barPct}%`, background: CAT_COLORS[i] }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function PlanificationStats() {
  const { planifId } = useParams<{ planifId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as {
    titre?: string
    classe?: string
    classeId?: number
    nbEleves?: number
    datePrevue?: string
    niveau?: string
    nbCorriges?: number
  } | null

  const titre     = state?.titre      ?? `Dictée #${planifId}`
  const classeNom = state?.classe     ?? ''
  const nbEleves  = state?.nbEleves   ?? null
  const datePrevue = state?.datePrevue ?? null
  const niveau    = state?.niveau     ?? null

  const [corrections, setCorrections] = useState<CorrectionRead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!planifId) return
    setLoading(true)
    getCorrections(Number(planifId))
      .then(c => setCorrections(c))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [planifId])

  const moyenne = useMemo(() => {
    if (corrections.length === 0) return null
    return Math.round(corrections.reduce((s, c) => s + c.score, 0) / corrections.length)
  }, [corrections])

  const bestScore = useMemo(() =>
    corrections.length > 0 ? Math.max(...corrections.map(c => c.score)) : null,
    [corrections]
  )

  const tauxReussite = useMemo(() => {
    if (corrections.length === 0) return null
    return Math.round((corrections.filter(c => c.score >= 70).length / corrections.length) * 100)
  }, [corrections])

  const errorsPerCat = useMemo(() => {
    const agg = Object.fromEntries(CATEGORIES.map(c => [c.key, 0])) as Record<CategoryKey, number>
    for (const corr of corrections) {
      for (const cat of CATEGORIES) {
        agg[cat.key] += (corr[CAT_ERR_KEY[cat.key]] as number) ?? 0
      }
    }
    return agg
  }, [corrections])

  const avgErrorsPerCat = useMemo<Record<CategoryKey, number>>(() => {
    if (corrections.length === 0)
      return Object.fromEntries(CATEGORIES.map(c => [c.key, 0])) as Record<CategoryKey, number>
    return Object.fromEntries(
      CATEGORIES.map(cat => [cat.key, errorsPerCat[cat.key] / corrections.length])
    ) as Record<CategoryKey, number>
  }, [errorsPerCat, corrections.length])

  const mainWeakness = useMemo(() => {
    let max = -1, cat: (typeof CATEGORIES)[number] = CATEGORIES[0]
    for (const c of CATEGORIES) {
      if (errorsPerCat[c.key] > max) { max = errorsPerCat[c.key]; cat = c }
    }
    return max > 0 ? cat : null
  }, [errorsPerCat])

  const sortedCorrections = useMemo(() =>
    [...corrections].sort((a, b) => b.score - a.score),
    [corrections]
  )

  const nbReussi = corrections.filter(c => c.score >= 70).length
  const tauxCompletion = nbEleves != null && nbEleves > 0
    ? Math.round((corrections.length / nbEleves) * 100)
    : null

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
            <h1 className="text-[24px] font-semibold text-[#101828] leading-9">{titre}</h1>
            <p className="text-[18px] font-medium text-[#ff9ad6]">Résultats de session &amp; analyse C.H.A.M.P.I.O.N</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 self-stretch justify-center">
          {niveau && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-medium text-[#0091ad] bg-[#e6f7fa] border border-[rgba(0,145,173,0.3)]">
              {niveau}
            </span>
          )}
          {classeNom && (
            <span className="text-[13px] font-medium text-[#0a0a0a] bg-white border border-black/10 px-3 py-1 rounded-[8px]">
              {classeNom}
            </span>
          )}
          {datePrevue && (
            <span className="text-[13px] text-[#6a7282] bg-[#f3f4f6] px-3 py-1 rounded-full">
              {formatDatePrevue(datePrevue)}
            </span>
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div className="flex gap-3">
        <StatCard
          title="Moyenne de Classe"
          value={moyenne !== null ? `${moyenne}%` : '—'}
          sub={tauxReussite !== null ? `${tauxReussite}% de réussite (≥70%)` : 'Pas encore de données'}
          iconBg="#dcfce7"
          icon={<BarChart2 size={18} color="#016630" />}
        />
        <StatCard
          title="Meilleure Note"
          value={bestScore !== null ? `${bestScore}%` : '—'}
          sub="Score le plus élevé de la session"
          iconBg="#ffeef8"
          icon={<Award size={18} color="#ab347b" />}
        />
        <StatCard
          title="Élèves Corrigés"
          value={corrections.length}
          sub={nbEleves != null ? `sur ${nbEleves} élèves` : 'corrections enregistrées'}
          iconBg="#e2fefe"
          icon={<Users size={18} color="#005768" />}
        />
        <StatCard
          title="Taux de Complétion"
          value={tauxCompletion !== null ? `${tauxCompletion}%` : '—'}
          sub={nbEleves != null ? `${corrections.length}/${nbEleves} copies corrigées` : 'copies corrigées'}
          iconBg="#fff4e4"
          icon={<CheckCircle size={18} color="#c9ae2e" />}
        />
      </div>

      {/* Analyse de Session */}
      <div className="bg-white border border-black/10 rounded-[14px] p-6">
        <div className="flex items-center gap-2 mb-1">
          <BarChart2 size={18} color="#0a0a0a" />
          <span className="text-[15px] font-medium text-[#0a0a0a]">Analyse de Session</span>
        </div>
        <p className="text-[13px] text-[#6a7282] mb-4">Insights automatiques basés sur les résultats de la session</p>
        <div className="flex gap-4">
          <div className="flex-1 flex items-start gap-3 bg-[#fafafa] rounded-[10px] p-4">
            <div className="size-10 rounded-full flex items-center justify-center shrink-0"
              style={{ background: moyenne !== null && moyenne >= 70 ? '#dcfce7' : '#fee2e2' }}>
              {moyenne !== null && moyenne >= 70
                ? <TrendingUp size={20} color="#016630" />
                : <TrendingDown size={20} color="#dc2626" />}
            </div>
            <div>
              <p className="text-[14px] font-medium text-[#101828]">Résultats Globaux</p>
              <p className="text-[12px] text-[#4a5565] leading-4 mt-0.5">
                {moyenne !== null
                  ? moyenne >= 70
                    ? `Bonne session — moyenne de ${moyenne}% pour la classe`
                    : `Session difficile — moyenne de ${moyenne}%, des efforts restent nécessaires`
                  : 'Pas encore de corrections'}
              </p>
            </div>
          </div>
          <div className="flex-1 flex items-start gap-3 bg-[#fafafa] rounded-[10px] p-4">
            <div className="size-10 rounded-full flex items-center justify-center shrink-0 bg-[#fff4e4]">
              <AlertTriangle size={20} color="#c9ae2e" />
            </div>
            <div>
              <p className="text-[14px] font-medium text-[#101828]">Catégorie Difficile</p>
              <p className="text-[12px] text-[#4a5565] leading-4 mt-0.5">
                {mainWeakness
                  ? `${mainWeakness.letter} (${mainWeakness.label}) — ${errorsPerCat[mainWeakness.key]} erreurs au total`
                  : 'Aucune erreur détectée'}
              </p>
            </div>
          </div>
          <div className="flex-1 flex items-start gap-3 bg-[#fafafa] rounded-[10px] p-4">
            <div className="size-10 rounded-full flex items-center justify-center shrink-0"
              style={{ background: tauxReussite !== null && tauxReussite >= 70 ? '#dcfce7' : '#ffeef8' }}>
              <CheckCircle size={20} color={tauxReussite !== null && tauxReussite >= 70 ? '#016630' : '#ab347b'} />
            </div>
            <div>
              <p className="text-[14px] font-medium text-[#101828]">Taux de Réussite</p>
              <p className="text-[12px] text-[#4a5565] leading-4 mt-0.5">
                {tauxReussite !== null
                  ? `${tauxReussite}% des élèves ont obtenu ≥ 70% (${nbReussi} sur ${corrections.length})`
                  : 'Pas encore de données'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="flex gap-3">
        <div className="bg-white border border-black/10 rounded-[14px] p-6 flex-1 min-w-0">
          <p className="text-[15px] font-medium text-[#0a0a0a] mb-1">Distribution des Notes</p>
          <p className="text-[13px] text-[#6a7282] mb-4">Répartition des scores par tranche</p>
          <ScoreHistogram corrections={corrections} />
        </div>
        <div className="bg-white border border-black/10 rounded-[14px] p-6 flex-1 min-w-0">
          <p className="text-[15px] font-medium text-[#0a0a0a] mb-1">Profil C.H.A.M.P.I.O.N de la Classe</p>
          <p className="text-[13px] text-[#6a7282] mb-4">Moyenne des erreurs par catégorie</p>
          <div className="flex justify-center py-2">
            <RadarChart values={avgErrorsPerCat} />
          </div>
        </div>
      </div>

      {/* Analyse Détaillée CHAMPION */}
      <div className="bg-white border border-black/10 rounded-[14px] p-6">
        <p className="text-[15px] font-medium text-[#0a0a0a] mb-1">Analyse Détaillée des Erreurs C.H.A.M.P.I.O.N</p>
        <p className="text-[13px] text-[#6a7282] mb-6">Répartition des erreurs par code pour l&apos;ensemble de la classe</p>
        <ChampionBars errorsPerCat={errorsPerCat} totalCorrections={corrections.length} />
      </div>

      {/* Tableau des résultats */}
      <div className="bg-white border border-black/10 rounded-[14px] overflow-hidden">
        <div className="px-6 pt-6 pb-4">
          <p className="text-[15px] font-medium text-[#0a0a0a]">Résultats Individuels</p>
          <p className="text-[13px] text-[#6a7282] mt-1">Classement des élèves par note</p>
        </div>
        {corrections.length === 0 ? (
          <div className="px-6 pb-6 text-[14px] text-[#9ca3af]">Aucune correction enregistrée</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[860px]">
              <thead>
                <tr className="border-t border-[#f3f4f6] bg-[#fafafa]">
                  <th className="px-4 py-3 text-[12px] font-medium text-[#6a7282] uppercase tracking-wider w-10">#</th>
                  <th className="px-4 py-3 text-[12px] font-medium text-[#6a7282] uppercase tracking-wider">Élève</th>
                  <th className="px-4 py-3 text-[12px] font-medium text-[#6a7282] uppercase tracking-wider">Note</th>
                  <th className="px-4 py-3 text-[12px] font-medium text-[#6a7282] uppercase tracking-wider">Erreurs</th>
                  {CATEGORIES.map(cat => (
                    <th key={cat.key} className="px-2 py-3 text-[12px] font-medium text-[#6a7282] text-center w-9">{cat.letter}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedCorrections.map((corr, rank) => (
                  <tr key={corr.id} className="border-t border-[#f3f4f6] hover:bg-[#fafafa]">
                    <td className="px-4 py-3 text-[13px] text-[#6a7282]">{rank + 1}</td>
                    <td className="px-4 py-3 text-[14px] font-medium text-[#101828]">{corr.student_name}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[13px] font-semibold"
                        style={{ background: scoreColor(corr.score) + '22', color: scoreColor(corr.score) }}>
                        {corr.score}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[14px] text-[#101828]">{corr.nb_errors}</td>
                    {CATEGORIES.map((cat, ci) => {
                      const val = (corr[CAT_ERR_KEY[cat.key]] as number) ?? 0
                      return (
                        <td key={cat.key} className="px-2 py-3 text-center">
                          {val > 0 ? (
                            <span className="inline-flex items-center justify-center size-6 rounded-[6px] text-[11px] font-semibold text-white"
                              style={{ background: CAT_COLORS[ci] }}>
                              {val}
                            </span>
                          ) : (
                            <span className="text-[12px] text-[#d1d5db]">—</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
