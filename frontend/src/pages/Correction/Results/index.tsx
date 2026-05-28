import { useEffect, useMemo, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronLeft, FileText, Calendar, User } from 'lucide-react'
import { CATEGORIES } from '../constants'
import type { CategoryKey, ErrorItem, CorrectionState } from '../constants'
import { createCorrection } from '../../../api/corrections'
import ScoreGlobal from './components/ScoreGlobal'
import CategorySummary from './components/CategorySummary'
import DetailedScoreGrid from './components/DetailedScoreGrid'
import { savePdf, printResults } from './utils/pdfExport'

interface LocationState extends CorrectionState {
  errors: ErrorItem[]
}

function getOverallPerf(score: number) {
  if (score >= 90) return { label: 'Excellent',    emoji: '🥇' }
  if (score >= 70) return { label: 'Bien',         emoji: '🥈' }
  return                   { label: 'À travailler', emoji: '📚' }
}

export default function Results() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState | null

  const { counts, totalErrors, score, neutralizedCount, typesEvaluated } = useMemo(() => {
    if (!state) return { counts: {} as Record<CategoryKey, number>, totalErrors: 0, score: 0, neutralizedCount: 0, typesEvaluated: 0 }

    const c = Object.fromEntries(CATEGORIES.map(cat => [cat.key, 0])) as Record<CategoryKey, number>
    for (const err of state.errors) {
      if (err.status === 'validated') c[err.category]++
    }

    const total = Object.values(c).reduce((a, b) => a + b, 0)

    const activeCategories = CATEGORIES.filter(cat => state.dictee.errors[cat.key] > 0)
    const neutralized = CATEGORIES.length - activeCategories.length

    let sc = 0
    if (activeCategories.length > 0) {
      const rates = activeCategories.map(cat => {
        const expected = state.dictee.errors[cat.key]
        return Math.max(0, (expected - c[cat.key]) / expected * 100)
      })
      sc = Math.round(rates.reduce((a, b) => a + b, 0) / rates.length)
    }

    return { counts: c, totalErrors: total, score: sc, neutralizedCount: neutralized, typesEvaluated: activeCategories.length }
  }, [state])

  const saved = useRef(false)

  useEffect(() => {
    if (!state) { navigate('/correction', { replace: true }) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!state || saved.current) return
    saved.current = true

    async function save() {
      let image: Blob | undefined
      try { image = await fetch(state!.previewUrl).then(r => r.blob()) } catch { /* no image */ }

      await createCorrection({
        dictee_id:        state!.dictee.id,
        score,
        nb_errors:        totalErrors,
        student_name:     state!.studentName ?? '',
        counts,
        planification_id: state!.planif?.id,
        eleve_id:         state!.planif?.eleve_id,
        image,
      })
    }
    save().catch(console.error)
  }, [score, totalErrors]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!state) return null
  const { dictee, studentName, planif } = state
  const overallPerf = getOverallPerf(score)
  const today = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={() => navigate(planif ? '/planification' : '/bibliotheque')}
          className="flex items-center gap-1.5 text-[14px] text-[#6a7282] hover:text-[#0a0a0a] transition-colors w-fit"
        >
          <ChevronLeft size={16} />
          {planif ? 'Retour à la Planification' : 'Retour aux dictées'}
        </button>
        <div className="flex flex-col gap-1">
          <h1 className="text-[20px] sm:text-[24px] font-semibold text-[#101828] leading-8">Résultats de la Dictée</h1>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-[14px] text-[#4a5565]">
              <FileText size={14} />
              <span>{dictee.titre}</span>
            </div>
            {studentName && (
              <div className="flex items-center gap-1.5 text-[14px] text-[#4a5565]">
                <User size={14} />
                <span>{studentName}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-[14px] text-[#4a5565]">
              <Calendar size={14} />
              <span>{today}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        <ScoreGlobal
          score={score}
          totalErrors={totalErrors}
          typesEvaluated={typesEvaluated}
          neutralizedCount={neutralizedCount}
          overallPerf={overallPerf}
        />
        <CategorySummary counts={counts} dictee={dictee} />
      </div>

      <DetailedScoreGrid
        counts={counts}
        dictee={dictee}
        onPrint={() => printResults({ dictee, studentName, counts, today })}
        onSavePdf={() => { void savePdf({ dictee, studentName, counts, today }) }}
      />
    </div>
  )
}
