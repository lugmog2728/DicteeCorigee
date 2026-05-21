import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import Stepper from '../components/Stepper'
import DropZone from './components/DropZone'
import DicteeSelector from './components/DicteeSelector'
import { getDictees } from '../../../api/dictees'
import type { DicteeApi } from '../../../api/dictees'
import { detectImage } from '../../../api/detection'

export default function Upload() {
  const navigate = useNavigate()
  const [isDragging, setIsDragging] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [dictees, setDictees] = useState<DicteeApi[]>([])
  const [selectedDicteeId, setSelectedDicteeId] = useState<number | ''>('')
  const [loading, setLoading] = useState(false)
  const [studentName, setStudentName] = useState('')

  useEffect(() => {
    getDictees().then(setDictees).catch(console.error)
  }, [])

  const selectedDictee = dictees.find(d => d.id === selectedDicteeId) ?? null

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return
    setImageFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }, [])

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }
  const onDragLeave = () => setIsDragging(false)

  async function handleDetect() {
    if (!imageFile || !selectedDictee) return
    setLoading(true)
    try {
      const detectionResult = await detectImage(imageFile)
      navigate('/correction/detection', {
        state: { previewUrl, dictee: selectedDictee, detectionResult, studentName },
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
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
            canProceed={!!previewUrl && !!selectedDicteeId}
            onChange={setSelectedDicteeId}
            onStudentName={setStudentName}
            onSubmit={() => { void handleDetect() }}
          />
        </div>
      </div>
    </div>
  )
}
