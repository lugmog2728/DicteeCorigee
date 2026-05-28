import { useRef, useEffect, useState } from 'react'
import { Pipette, X } from 'lucide-react'
import type { TargetHsv } from '../../../../api/detection'

interface Props {
  imageUrl: string
  onColorSampled: (hsv: TargetHsv | null) => void
}

function rgbToOpenCvHsv(r: number, g: number, b: number): TargetHsv {
  const rn = r / 255, gn = g / 255, bn = b / 255
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn)
  const delta = max - min

  let h = 0
  if (delta > 0) {
    if (max === rn)      h = ((gn - bn) / delta) % 6
    else if (max === gn) h = (bn - rn) / delta + 2
    else                 h = (rn - gn) / delta + 4
    h = h * 60
    if (h < 0) h += 360
  }

  const s = max === 0 ? 0 : delta / max
  return {
    h: Math.round(h / 2),        // OpenCV H: 0-180
    s: Math.round(s * 255),      // OpenCV S: 0-255
    v: Math.round(max * 255),    // OpenCV V: 0-255
  }
}

export default function ColorSampler({ imageUrl, onColorSampled }: Props) {
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const hiddenRef  = useRef<HTMLCanvasElement>(null)
  const [sampled, setSampled] = useState<TargetHsv | null>(null)
  const [previewColor, setPreviewColor] = useState<string>('')

  useEffect(() => {
    const img = new Image()
    img.src = imageUrl
    img.onload = () => {
      const hidden = hiddenRef.current
      const canvas = canvasRef.current
      if (!hidden || !canvas) return
      hidden.width  = img.naturalWidth
      hidden.height = img.naturalHeight
      hidden.getContext('2d')!.drawImage(img, 0, 0)

      const MAX_W = canvas.offsetWidth || 520
      const scale = Math.min(MAX_W / img.naturalWidth, 260 / img.naturalHeight)
      canvas.width  = Math.round(img.naturalWidth  * scale)
      canvas.height = Math.round(img.naturalHeight * scale)
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    }
  }, [imageUrl])

  function handleClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current
    const hidden = hiddenRef.current
    if (!canvas || !hidden) return

    const rect   = canvas.getBoundingClientRect()
    const scaleX = hidden.width  / canvas.width
    const scaleY = hidden.height / canvas.height
    const cx = Math.round((e.clientX - rect.left) * scaleX)
    const cy = Math.round((e.clientY - rect.top)  * scaleY)

    const ctx  = hidden.getContext('2d')!
    const half = 2
    const x0   = Math.max(0, cx - half)
    const y0   = Math.max(0, cy - half)
    const x1   = Math.min(hidden.width  - 1, cx + half)
    const y1   = Math.min(hidden.height - 1, cy + half)
    const data = ctx.getImageData(x0, y0, x1 - x0 + 1, y1 - y0 + 1).data

    const rs: number[] = [], gs: number[] = [], bs: number[] = []
    for (let i = 0; i < data.length; i += 4) {
      rs.push(data[i]); gs.push(data[i+1]); bs.push(data[i+2])
    }
    const med = (arr: number[]) => { const s = [...arr].sort((a,b)=>a-b); return s[Math.floor(s.length/2)] }
    const r = med(rs), g = med(gs), b = med(bs)

    const hsv = rgbToOpenCvHsv(r, g, b)
    setSampled(hsv)
    setPreviewColor(`rgb(${r},${g},${b})`)
    onColorSampled(hsv)

    const ctx2 = canvas.getContext('2d')!
    const sx = Math.round(cx / scaleX), sy = Math.round(cy / scaleY)
    ctx2.beginPath()
    ctx2.arc(sx, sy, 7, 0, Math.PI * 2)
    ctx2.strokeStyle = '#ffffff'
    ctx2.lineWidth = 2
    ctx2.stroke()
    ctx2.beginPath()
    ctx2.arc(sx, sy, 5, 0, Math.PI * 2)
    ctx2.fillStyle = previewColor || `rgb(${r},${g},${b})`
    ctx2.fill()
  }

  function handleReset() {
    setSampled(null)
    setPreviewColor('')
    onColorSampled(null)
    const img = new Image()
    img.src = imageUrl
    img.onload = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
    }
  }

  return (
    <div className="flex flex-col gap-3 p-4 bg-white border border-[rgba(0,0,0,0.1)] rounded-[12px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Pipette size={15} className="text-[#0091ad]" />
          <span className="text-[13px] font-medium text-[#364153]">Couleur de correction</span>
        </div>
        {sampled && (
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 text-[12px] text-[#6a7282] hover:text-[#0a0a0a] transition-colors"
          >
            <X size={12} />
            Réinitialiser
          </button>
        )}
      </div>

      {!sampled ? (
        <p className="text-[12px] text-[#6a7282]">
          Cliquez sur une marque de correction dans l'image ci-dessous pour échantillonner sa couleur.
        </p>
      ) : (
        <div className="flex items-center gap-2">
          <div
            className="size-5 rounded-full border border-[rgba(0,0,0,0.15)] shrink-0"
            style={{ backgroundColor: previewColor }}
          />
          <span className="text-[12px] text-[#364153] font-medium">Couleur sélectionnée</span>
          <span className="text-[11px] text-[#9ca3af] ml-auto">
            H:{sampled.h} S:{sampled.s} V:{sampled.v}
          </span>
        </div>
      )}

      <canvas
        ref={canvasRef}
        onClick={handleClick}
        className="w-full rounded-[8px] border border-[rgba(0,0,0,0.08)]"
        style={{ cursor: 'crosshair', maxHeight: '260px', objectFit: 'contain' }}
      />
      <canvas ref={hiddenRef} style={{ display: 'none' }} />
    </div>
  )
}
