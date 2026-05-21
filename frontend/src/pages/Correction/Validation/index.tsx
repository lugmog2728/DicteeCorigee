import { useEffect, useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronLeft, Check, FileText, Save } from 'lucide-react'
import Button from '../../../components/Button'
import { CATEGORIES, LETTER_TO_CATEGORY, CAT_BY_KEY } from '../constants'
import type { CategoryKey, ErrorItem, CorrectionState } from '../constants'
import Stepper from '../components/Stepper'
import AnnotatedImage from './components/AnnotatedImage'
import ErrorCard from './components/ErrorCard'
import QuickSummary from './components/QuickSummary'

export default function Validation() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as CorrectionState | null

  const [errors, setErrors] = useState<ErrorItem[]>(() => {
    if (!state) return []
    return state.detectionResult.letters.map((l, i) => ({
      id: i,
      letter: l.letter,
      category: LETTER_TO_CATEGORY[l.letter] ?? 'orthographe',
      confidence: l.confidence,
      x: l.x, y: l.y, w: l.w, h: l.h,
      status: 'pending' as const,
    }))
  })

  useEffect(() => {
    if (!state) navigate('/correction', { replace: true })
  }, [state, navigate])

  const currentError = errors.find(e => e.status === 'pending') ?? null
  const validatedCount = errors.filter(e => e.status !== 'pending').length
  const allProcessed = validatedCount === errors.length && errors.length > 0

  const summaryCounts = useMemo(() => {
    const c = Object.fromEntries(CATEGORIES.map(cat => [cat.key, 0])) as Record<CategoryKey, number>
    for (const err of errors) {
      if (err.status === 'validated') c[err.category]++
    }
    return c
  }, [errors])

  if (!state) return null
  const { previewUrl, dictee } = state

  function validate() {
    if (!currentError) return
    setErrors(prev => prev.map(e => e.id === currentError.id ? { ...e, status: 'validated' } : e))
  }

  function reject() {
    if (!currentError) return
    setErrors(prev => prev.map(e => e.id === currentError.id ? { ...e, status: 'rejected' } : e))
  }

  function changeCategory(category: CategoryKey) {
    if (!currentError) return
    setErrors(prev => prev.map(e => e.id === currentError.id ? { ...e, category, letter: CAT_BY_KEY[category].letter } : e))
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-[14px] text-[#6a7282] hover:text-[#0a0a0a] transition-colors w-fit"
        >
          <ChevronLeft size={16} />
          Annuler
        </button>
        <div className="flex flex-col gap-1">
          <h1 className="text-[24px] font-semibold text-[#101828] leading-[32px]">Corriger une Dictée</h1>
          <div className="flex items-center gap-2 text-[16px] font-medium text-[#4a5565]">
            <FileText size={16} />
            <span>{dictee.titre}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Stepper activeStep={2} />
        </div>
      </div>

      <div className="flex gap-6 items-start">
        <AnnotatedImage
          previewUrl={previewUrl}
          errors={errors}
          currentError={currentError}
          validatedCount={validatedCount}
          totalCount={errors.length}
        />

        <div className="flex-1 min-w-0 flex flex-col gap-4">
          <div className="bg-white border border-[rgba(0,0,0,0.1)] rounded-[14px] p-6 flex flex-col gap-4">
            <p className="text-[16px] font-medium text-[#0a0a0a]">Valider les Erreurs</p>
            {currentError ? (
              <ErrorCard
                error={currentError}
                onValidate={validate}
                onReject={reject}
                onChangeCategory={changeCategory}
              />
            ) : (
              <div className="border border-[#e5e7eb] rounded-[10px] p-4 flex items-center gap-2 text-[14px] text-[#00a63e]">
                <Check size={16} />
                Toutes les erreurs ont été traitées
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Button
              label="Enregistrer et Voir les Résultats"
              variant="primary"
              icon={<Save size={16} />}
              disabled={!allProcessed}
              className="w-full justify-center"
              onClick={() => navigate('/correction/results', { state: { ...state, errors } })}
            />
            {!allProcessed && (
              <p className="text-[12px] text-[#e17100] text-center">
                ⚠️ Veuillez valider ou supprimer toutes les erreurs actives
              </p>
            )}
          </div>

          <QuickSummary counts={summaryCounts} />
        </div>
      </div>
    </div>
  )
}
