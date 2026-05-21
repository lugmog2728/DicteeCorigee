import { useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronLeft, FileText } from 'lucide-react'
import { CATEGORIES, LETTER_TO_CATEGORY } from '../constants'
import type { CategoryKey, CorrectionState } from '../constants'
import Stepper from '../components/Stepper'
import AnnotatedImage from './components/AnnotatedImage'
import DetectionSummary from './components/DetectionSummary'

export default function Detection() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as CorrectionState | null

  useEffect(() => {
    if (!state) navigate('/correction', { replace: true })
  }, [state, navigate])

  const counts = useMemo(() => {
    const c = Object.fromEntries(CATEGORIES.map(cat => [cat.key, 0])) as Record<CategoryKey, number>
    if (!state) return c
    for (const letter of state.detectionResult.letters) {
      const cat = LETTER_TO_CATEGORY[letter.letter]
      if (cat) c[cat]++
    }
    return c
  }, [state])

  if (!state) return null
  const { previewUrl, dictee, detectionResult } = state

  const totalErrors = detectionResult.count
  const wordCount = dictee.texte.split(/\s+/).filter(Boolean).length
  const score = Math.max(0, Math.round((wordCount - totalErrors) / wordCount * 100))
  const avgConfidence = totalErrors > 0
    ? Math.round(detectionResult.letters.reduce((acc, l) => acc + l.confidence, 0) / totalErrors * 100)
    : 100

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
          <h1 className="text-[20px] sm:text-[24px] font-semibold text-[#101828] leading-8">Corriger une Dictée</h1>
          <div className="flex items-center gap-2 text-[15px] sm:text-[16px] font-medium text-[#4a5565]">
            <FileText size={16} />
            <span className="truncate">{dictee.titre}</span>
          </div>
        </div>
        <Stepper activeStep={1} />
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        <AnnotatedImage previewUrl={previewUrl} detectionResult={detectionResult} />
        <DetectionSummary
          counts={counts}
          totalErrors={totalErrors}
          score={score}
          avgConfidence={avgConfidence}
          onNext={() => navigate('/correction/validation', { state })}
        />
      </div>
    </div>
  )
}
