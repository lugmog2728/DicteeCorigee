import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Upload, Camera, FolderOpen, ChevronDown, ArrowRight, ChevronLeft, BookOpen } from 'lucide-react'
import Button from '../../components/Button'

const DICTEE_TEXT = `Les dinosaures ont vécu sur Terre pendant des millions d'années. Ces animaux fascinants régnaient sur tous les continents. Certains étaient herbivores et se nourrissaient de plantes, tandis que d'autres étaient carnivores et chassaient leurs proies. Les scientifiques étudient leurs fossiles pour mieux comprendre cette époque lointaine.`

const STEPS = ['Téléverser', 'Détection', 'Validation']

export default function Correction() {
  const navigate = useNavigate()
  const [isDragging, setIsDragging] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedStudent, setSelectedStudent] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  function handleFile(file: File) {
    if (!file.type.startsWith('image/')) return
    setPreviewUrl(URL.createObjectURL(file))
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [])

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }
  const onDragLeave = () => setIsDragging(false)

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const canProceed = !!previewUrl && !!selectedStudent

  return (
    <div className="flex flex-col gap-6 max-w-5xl">

      {/* Header */}
      <div className="flex flex-col gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-[14px] text-[#6a7282] hover:text-[#0a0a0a] transition-colors w-fit"
        >
          <ChevronLeft size={16} />
          Annuler
        </button>

        <h1 className="text-[24px] font-semibold text-[#101828] leading-[32px]">Corriger une Dictée</h1>

        {/* Stepper */}
        <div className="flex items-center gap-4">
          {STEPS.map((step, i) => (
            <div key={step} className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`size-8 rounded-full flex items-center justify-center text-[14px] font-semibold ${i === 0 ? 'bg-[var(--ocean-blue-500)] text-white' : 'bg-[#e5e7eb] text-[#4a5565]'}`}>
                  {i + 1}
                </div>
                <span className={`text-[14px] font-medium ${i === 0 ? 'text-[var(--ocean-blue-500)]' : 'text-[#99a1af]'}`}>
                  {step}
                </span>
              </div>
              {i < STEPS.length - 1 && <ArrowRight size={16} className="text-[#d1d5dc]" />}
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex gap-6 items-start">

        {/* Left column */}
        <div className="flex flex-col gap-6 flex-1 min-w-0">

          {/* Dictée planifiée */}
          <div className="bg-white border border-[var(--ocean-blue-500)] rounded-[14px] p-6">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-full bg-[rgba(0,145,173,0.1)] flex items-center justify-center shrink-0">
                <BookOpen size={20} className="text-[var(--ocean-blue-500)]" />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-[18px] font-medium text-[#101828]">Dictée Planifiée</p>
                <p className="text-[14px] text-[#4a5565]">
                  Vous corrigez la dictée <strong>"Les dinosaures"</strong> pour la classe <strong>CM1-A</strong>
                </p>
                <div className="flex items-center gap-3 mt-1">
                  {['35 mots', 'CM1', '22 minutes'].map(info => (
                    <span key={info} className="text-[12px] text-[#6a7282]">• {info}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Zone upload */}
          <div className="bg-white border border-[rgba(0,0,0,0.1)] rounded-[14px] p-6">
            <p className="text-[16px] font-medium text-[#0a0a0a] mb-4">Téléverser une Copie Corrigée</p>

            {previewUrl ? (
              <div className="relative rounded-[10px] overflow-hidden border border-[#d1d5dc]">
                <img src={previewUrl} alt="Copie corrigée" className="w-full object-contain max-h-[400px]" />
                <button
                  onClick={() => setPreviewUrl(null)}
                  className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-gray-100"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`border-[1.6px] border-dashed rounded-[10px] flex flex-col items-center justify-center gap-3 py-14 cursor-pointer transition-colors ${isDragging ? 'border-[var(--ocean-blue-500)] bg-[rgba(0,145,173,0.04)]' : 'border-[#d1d5dc] hover:border-[var(--ocean-blue-500)] hover:bg-[rgba(0,145,173,0.02)]'}`}
              >
                <Upload size={48} className="text-[#99a1af]" />
                <p className="text-[16px] text-[#4a5565] text-center max-w-[340px]">
                  Glissez-déposez votre image ici, prenez un photo ou cliquez pour parcourir
                </p>
                <p className="text-[14px] text-[#99a1af]">Formats acceptés : JPG, PNG (max 10MB)</p>
              </div>
            )}

            {/* Actions upload */}
            {!previewUrl && (
              <div className="flex items-center gap-3 mt-4">
                <Button
                  label="Parcourir"
                  variant="outline"
                  icon={<FolderOpen size={16} />}
                  onClick={() => fileInputRef.current?.click()}
                />
                <Button
                  label="Appareil photo"
                  variant="outline"
                  icon={<Camera size={16} />}
                  onClick={() => cameraInputRef.current?.click()}
                />
              </div>
            )}

            {/* Inputs cachés */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFileChange}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={onFileChange}
            />
          </div>
        </div>

        {/* Right column */}
        <div className="w-[266px] shrink-0">
          <div className="bg-white border border-[rgba(0,0,0,0.1)] rounded-[14px] p-6 flex flex-col gap-6">
            <p className="text-[16px] font-medium text-[#0a0a0a]">Détails de la Dictée</p>

            {/* Élève */}
            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-medium text-[#0a0a0a]">Élève</label>
              <div className="relative">
                <select
                  className="w-full h-[36px] bg-[#f3f3f5] rounded-[8px] px-3 pr-8 text-[14px] text-[#717182] appearance-none outline-none focus:border focus:border-[var(--ocean-blue-500)]"
                  value={selectedStudent}
                  onChange={e => setSelectedStudent(e.target.value)}
                >
                  <option value="" disabled>Sélectionner un élève</option>
                  <option>Alice Martin</option>
                  <option>Baptiste Dupont</option>
                  <option>Clara Petit</option>
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#717182] pointer-events-none" />
              </div>
            </div>

            {/* Texte de la dictée */}
            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-medium text-[#0a0a0a]">Texte de la Dictée</label>
              <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded-[8px] p-3 max-h-[200px] overflow-y-auto">
                <p className="text-[13px] text-[#364153] leading-[20px]">{DICTEE_TEXT}</p>
              </div>
            </div>

            {/* CTA */}
            <Button
              label="Passer à la Détection"
              variant="primary"
              icon={<ArrowRight size={16} />}
              disabled={!canProceed}
              className="w-full justify-center"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
