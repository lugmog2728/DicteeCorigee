import { useState, useCallback, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import Stepper from '../components/Stepper'
import DropZone from './components/DropZone'
import DicteeSelector from './components/DicteeSelector'
import { getDictees } from '../../../api/dictees'
import type { DicteeApi } from '../../../api/dictees'
import { getEleves } from '../../../api/eleves'
import type { EleveApi } from '../../../api/eleves'
import { detectImage } from '../../../api/detection'

interface PlanifRouteState {
  planifId:   number
  classeId:   number
  dicteeId:   number
  nbCorriges: number
}

export default function Upload() {
  const navigate = useNavigate()
  const location = useLocation()

  // Detect planif mode from navigation state
  const routeState = location.state as PlanifRouteState | null
  const planifMode = !!(routeState?.planifId)

  const [isDragging, setIsDragging]       = useState(false)
  const [previewUrl, setPreviewUrl]       = useState<string | null>(null)
  const [imageFile, setImageFile]         = useState<File | null>(null)
  const [dictees, setDictees]             = useState<DicteeApi[]>([])
  const [eleves, setEleves]               = useState<EleveApi[]>([])
  const [selectedDicteeId, setSelectedDicteeId] = useState<number | ''>(routeState?.dicteeId ?? '')
  const [selectedEleveId, setSelectedEleveId]   = useState<number | ''>('')
  const [loading, setLoading]             = useState(false)
  const [studentName, setStudentName]     = useState('')

  useEffect(() => {
    if (planifMode) {
      // In planif mode: fetch only the needed dictee + class eleves
      Promise.all([
        getDictees(),
        getEleves(routeState!.classeId),
      ]).then(([d, e]) => {
        setDictees(d)
        setEleves(e)
      }).catch(console.error)
    } else {
      getDictees().then(setDictees).catch(console.error)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const selectedDictee = dictees.find(d => d.id === selectedDicteeId) ?? null

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return
    setImageFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }, [])

  const onDragOver  = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }
  const onDragLeave = () => setIsDragging(false)

  async function handleDetect() {
    if (!imageFile || !selectedDictee) return
    setLoading(true)
    try {
      const detectionResult = await detectImage(imageFile)
      navigate('/correction/detection', {
        state: {
          previewUrl,
          dictee: selectedDictee,
          detectionResult,
          studentName,
          planif: planifMode ? {
            id:          routeState!.planifId,
            classe_id:   routeState!.classeId,
            nb_corriges: routeState!.nbCorriges,
            eleve_id:    selectedEleveId ? Number(selectedEleveId) : undefined,
          } : undefined,
        },
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const canProceed = !!previewUrl && !!selectedDicteeId && (!planifMode || !!selectedEleveId)

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={() => navigate(planifMode ? '/planification' : -1 as never)}
          className="flex items-center gap-1.5 text-[14px] text-[#6a7282] hover:text-[#0a0a0a] transition-colors w-fit"
        >
          <ChevronLeft size={16} />
          {planifMode ? 'Retour à la Planification' : 'Annuler'}
        </button>
        <h1 className="text-[20px] sm:text-[24px] font-semibold text-[#101828] leading-8">Corriger une Dictée</h1>
        <Stepper activeStep={0} />
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="flex-1 min-w-0 w-full">
          <DropZone
            previewUrl={previewUrl}
            isDragging={isDragging}
            onFile={handleFile}
            onRemove={() => { setPreviewUrl(null); setImageFile(null) }}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
          />
        </div>
        <div className="w-full md:w-66.5 md:shrink-0">
          <DicteeSelector
            dictees={dictees}
            selectedDicteeId={selectedDicteeId}
            studentName={studentName}
            loading={loading}
            canProceed={canProceed}
            onChange={setSelectedDicteeId}
            onStudentName={setStudentName}
            onSubmit={() => { void handleDetect() }}
            planifMode={planifMode}
            eleves={eleves}
            selectedEleveId={selectedEleveId}
            onEleveChange={setSelectedEleveId}
          />
        </div>
      </div>
    </div>
  )
}
