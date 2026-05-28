import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronLeft, RotateCcw, ArrowRight, Loader2, AlertCircle } from 'lucide-react'
import { HsvColorPicker } from 'react-colorful'
import type { HsvColor } from 'react-colorful'
import Stepper from '../components/Stepper'
import ImageSampler from './ImageSampler'
import { detectImage } from '../../../api/detection'
import type { TargetHsv } from '../../../api/detection'
import type { DicteeApi } from '../../../api/dictees'
import type { CorrectionPlanif } from '../constants'

interface ColorPageState {
  imageFile:   File
  previewUrl:  string
  dictee:      DicteeApi
  studentName: string
  planif?:     CorrectionPlanif
}

function hsvToCss({ h, s, v }: HsvColor): string {
  const S = s / 100, V = v / 100, C = V * S
  const X = C * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = V - C
  let r = 0, g = 0, b = 0
  if      (h < 60)  { r = C; g = X }
  else if (h < 120) { r = X; g = C }
  else if (h < 180) { g = C; b = X }
  else if (h < 240) { g = X; b = C }
  else if (h < 300) { r = X; b = C }
  else              { r = C; b = X }
  return `rgb(${Math.round((r + m) * 255)},${Math.round((g + m) * 255)},${Math.round((b + m) * 255)})`
}

function toOpenCvHsv({ h, s, v }: HsvColor): TargetHsv {
  return { h: Math.round(h / 2), s: Math.round(s * 2.55), v: Math.round(v * 2.55) }
}

export default function ColorPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state    = location.state as ColorPageState | null

  const [color,   setColor]   = useState<HsvColor | null>(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    if (!state?.imageFile) navigate('/correction', { replace: true })
  }, [state, navigate])

  if (!state) return null

  async function runDetection(skipColor = false) {
    setLoading(true)
    setError(null)
    try {
      const targetHsv = (!skipColor && color) ? toOpenCvHsv(color) : undefined
      const detectionResult = await detectImage(state!.imageFile, targetHsv)
      navigate('/correction/detection', {
        state: {
          previewUrl:      state!.previewUrl,
          dictee:          state!.dictee,
          detectionResult,
          studentName:     state!.studentName,
          planif:          state!.planif,
        },
      })
    } catch {
      setError("Erreur lors de la détection. Vérifiez l'image et réessayez.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-[14px] text-[#6a7282] hover:text-[#0a0a0a] transition-colors w-fit"
        >
          <ChevronLeft size={16} />
          Retour
        </button>
        <h1 className="text-[20px] sm:text-[24px] font-semibold text-[#101828] leading-8">Corriger une Dictée</h1>
        <Stepper activeStep={1} />
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* Image avec sampler intégré */}
        <div className="flex-1 min-w-0 bg-white border border-[rgba(0,0,0,0.1)] rounded-[14px] overflow-hidden">
          <div className="px-4 pt-4 pb-3 border-b border-[#f3f4f6]">
            <p className="text-[13px] font-medium text-[#364153]">Copie de l'élève</p>
            <p className="text-[12px] text-[#9ca3af] mt-0.5">
              {state.dictee.titre} · {state.studentName || 'Élève'}
            </p>
          </div>
          <ImageSampler
            imageUrl={state.previewUrl}
            sampled={!!color}
            onSample={setColor}
          />
        </div>

        {/* Panneau picker */}
        <div className="w-full lg:w-[360px] shrink-0 flex flex-col gap-4">

          <div className="bg-white border border-[rgba(0,0,0,0.1)] rounded-[14px] p-5 flex flex-col gap-5">
            <div>
              <h2 className="text-[15px] font-semibold text-[#101828]">Couleur de correction</h2>
              <p className="text-[13px] text-[#6a7282] mt-1 leading-relaxed">
                Cliquez sur une marque de correction dans la copie pour échantillonner sa couleur. Affinez ensuite si besoin.
              </p>
            </div>

            {!color && (
              <div className="flex items-center justify-center h-[120px] rounded-[10px] bg-[#f9fafb] border border-dashed border-[#d1d5dc]">
                <p className="text-[12px] text-[#9ca3af]">En attente d'un échantillon…</p>
              </div>
            )}

            {color && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className="size-10 rounded-full border-2 border-white shadow-md shrink-0"
                    style={{ backgroundColor: hsvToCss(color) }}
                  />
                  <div className="flex flex-col">
                    <span className="text-[13px] font-medium text-[#101828]">Couleur sélectionnée</span>
                    <span className="text-[11px] text-[#9ca3af] font-mono">
                      H:{color.h}° S:{color.s}% V:{color.v}%
                    </span>
                  </div>
                  <button
                    type="button"
                    title="Réinitialiser la couleur"
                    onClick={() => setColor(null)}
                    className="ml-auto text-[#9ca3af] hover:text-[#364153] transition-colors"
                  >
                    <RotateCcw size={14} />
                  </button>
                </div>

                <HsvColorPicker
                  color={color}
                  onChange={setColor}
                  style={{ width: '100%', height: '220px' }}
                />
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-[10px] bg-[#fef2f2] border border-[#fecaca]">
                <AlertCircle size={15} className="text-[#dc2626] shrink-0 mt-0.5" />
                <p className="text-[12px] text-[#dc2626] leading-relaxed">{error}</p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              disabled={loading || !color}
              onClick={() => runDetection(false)}
              className="flex items-center justify-center gap-2 w-full h-[44px] rounded-[10px] text-[14px] font-semibold text-white bg-[#0091ad] hover:bg-[#007a93] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" />Analyse en cours...</>
              ) : (
                <><ArrowRight size={16} />Lancer la détection</>
              )}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => runDetection(true)}
              className="text-[13px] text-[#6a7282] hover:text-[#364153] transition-colors text-center py-1 disabled:opacity-50"
            >
              Passer — utiliser la détection automatique
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
