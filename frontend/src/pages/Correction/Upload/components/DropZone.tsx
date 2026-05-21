import { useRef, useCallback } from 'react'
import { X, Upload, Camera, FolderOpen } from 'lucide-react'
import Button from '../../../../components/Button'

const IS_MOBILE = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

interface Props {
  previewUrl: string | null
  isDragging: boolean
  onFile: (file: File) => void
  onRemove: () => void
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: () => void
}

export default function DropZone({ previewUrl, isDragging, onFile, onRemove, onDragOver, onDragLeave }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) onFile(file)
  }, [onFile])

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) onFile(file)
  }

  return (
    <div className="bg-white border border-[rgba(0,0,0,0.1)] rounded-[14px] p-6">
      <p className="text-[16px] font-medium text-[#0a0a0a] mb-4">Téléverser une Copie</p>

      {previewUrl ? (
        <div className="relative rounded-[10px] overflow-hidden border border-[#d1d5dc]">
          <img src={previewUrl} alt="Copie" className="w-full object-contain max-h-[400px]" />
          <button
            type="button"
            onClick={onRemove}
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
          className={`border-[1.6px] border-dashed rounded-[10px] flex flex-col items-center justify-center gap-3 py-8 sm:py-14 cursor-pointer transition-colors ${isDragging ? 'border-(--ocean-blue-500) bg-[rgba(0,145,173,0.04)]' : 'border-[#d1d5dc] hover:border-(--ocean-blue-500) hover:bg-[rgba(0,145,173,0.02)]'}`}
        >
          <Upload size={48} className="text-[#99a1af]" />
          <p className="text-[16px] text-[#4a5565] text-center max-w-[340px]">
            Glissez-déposez votre image ici, prenez une photo ou cliquez pour parcourir
          </p>
          <p className="text-[14px] text-[#99a1af]">Formats acceptés : JPG, PNG (max 10MB)</p>
        </div>
      )}

      {!previewUrl && (
        <div className="flex items-center gap-3 mt-4">
          <Button label="Parcourir" variant="outline" icon={<FolderOpen size={16} />} onClick={() => fileInputRef.current?.click()} />
          {IS_MOBILE && (
            <Button label="Appareil photo" variant="outline" icon={<Camera size={16} />} onClick={() => cameraInputRef.current?.click()} />
          )}
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onFileChange} />
    </div>
  )
}
