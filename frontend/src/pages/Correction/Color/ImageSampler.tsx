import { useRef, useEffect, useState } from 'react'
import type { HsvColor } from 'react-colorful'

interface Props {
  imageUrl: string
  sampled:  boolean
  onSample: (color: HsvColor) => void
}

const MAX_W    = 1400
const LOUPE_R  = 80    // loupe radius in canvas pixels
const ZOOM     = 5     // magnification factor

function pixelsToHsv(data: Uint8ClampedArray): HsvColor {
  const rs: number[] = [], gs: number[] = [], bs: number[] = []
  for (let i = 0; i < data.length; i += 4) {
    rs.push(data[i]); gs.push(data[i + 1]); bs.push(data[i + 2])
  }
  const med = (a: number[]) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)] }
  const r = med(rs) / 255, g = med(gs) / 255, b = med(bs) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min
  let h = 0
  if (d > 0) {
    if (max === r)      h = ((g - b) / d + (g < b ? 6 : 0)) * 60
    else if (max === g) h = ((b - r) / d + 2) * 60
    else                h = ((r - g) / d + 4) * 60
  }
  return { h: Math.round(h), s: Math.round(max === 0 ? 0 : d / max * 100), v: Math.round(max * 100) }
}

export default function ImageSampler({ imageUrl, sampled, onSample }: Props) {
  const displayRef = useRef<HTMLCanvasElement>(null)
  const hiddenRef  = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(false)
    const img = new Image()
    img.src = imageUrl
    img.onload = () => {
      const hidden  = hiddenRef.current
      const display = displayRef.current
      if (!hidden || !display) return

      // Hidden: full resolution
      hidden.width  = img.naturalWidth
      hidden.height = img.naturalHeight
      const hctx = hidden.getContext('2d')!
      hctx.drawImage(img, 0, 0)

      // Display: capped at MAX_W
      const scale = Math.min(1, MAX_W / img.naturalWidth)
      display.width  = Math.round(img.naturalWidth  * scale)
      display.height = Math.round(img.naturalHeight * scale)
      const dctx = display.getContext('2d')!
      dctx.imageSmoothingEnabled = true
      dctx.imageSmoothingQuality = 'high'
      dctx.drawImage(img, 0, 0, display.width, display.height)

      setReady(true)
    }
  }, [imageUrl])

  function canvasCoords(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = displayRef.current!
    const rect   = canvas.getBoundingClientRect()
    return {
      cx: (e.clientX - rect.left)  * (canvas.width  / rect.width),
      cy: (e.clientY - rect.top)   * (canvas.height / rect.height),
    }
  }

  function drawLoupe(cx: number, cy: number) {
    const display = displayRef.current
    const hidden  = hiddenRef.current
    if (!display || !hidden) return

    const dctx = display.getContext('2d')!
    const img  = new Image()
    img.src = imageUrl

    // Redraw base image
    dctx.imageSmoothingEnabled = true
    dctx.imageSmoothingQuality = 'high'
    dctx.drawImage(hidden, 0, 0, display.width, display.height)

    // Compute source rect in hidden canvas
    const hsx = hidden.width  / display.width
    const hsy = hidden.height / display.height
    const srcR = (LOUPE_R / ZOOM) * Math.max(hsx, hsy)
    const fx   = cx * hsx
    const fy   = cy * hsy

    // Clip to loupe circle
    dctx.save()
    dctx.beginPath()
    dctx.arc(cx, cy, LOUPE_R, 0, Math.PI * 2)
    dctx.clip()

    // Draw zoomed, smooth content
    dctx.imageSmoothingEnabled = true
    dctx.imageSmoothingQuality = 'high'
    dctx.drawImage(
      hidden,
      fx - srcR, fy - srcR, srcR * 2, srcR * 2,
      cx - LOUPE_R, cy - LOUPE_R, LOUPE_R * 2, LOUPE_R * 2,
    )
    dctx.restore()

    // Outer border
    dctx.beginPath()
    dctx.arc(cx, cy, LOUPE_R, 0, Math.PI * 2)
    dctx.strokeStyle = 'rgba(0,0,0,0.3)'
    dctx.lineWidth = 4
    dctx.stroke()
    dctx.strokeStyle = '#ffffff'
    dctx.lineWidth = 2
    dctx.stroke()

    // Crosshair
    const ch = 12
    dctx.strokeStyle = '#ffffff'
    dctx.lineWidth   = 2
    dctx.beginPath()
    dctx.moveTo(cx - ch, cy); dctx.lineTo(cx + ch, cy)
    dctx.moveTo(cx, cy - ch); dctx.lineTo(cx, cy + ch)
    dctx.stroke()
    dctx.strokeStyle = 'rgba(0,0,0,0.5)'
    dctx.lineWidth   = 1
    dctx.beginPath()
    dctx.moveTo(cx - ch, cy); dctx.lineTo(cx + ch, cy)
    dctx.moveTo(cx, cy - ch); dctx.lineTo(cx, cy + ch)
    dctx.stroke()
  }

  function resetCanvas() {
    const display = displayRef.current
    const hidden  = hiddenRef.current
    if (!display || !hidden) return
    const ctx = display.getContext('2d')!
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(hidden, 0, 0, display.width, display.height)
  }

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!ready) return
    const { cx, cy } = canvasCoords(e)
    drawLoupe(cx, cy)
  }

  function handleMouseLeave() {
    if (!ready) return
    resetCanvas()
  }

  function handleClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const hidden = hiddenRef.current
    const display = displayRef.current
    if (!hidden || !display) return

    const rect   = display.getBoundingClientRect()
    const hsx    = hidden.width  / rect.width
    const hsy    = hidden.height / rect.height
    const fx     = (e.clientX - rect.left) * hsx
    const fy     = (e.clientY - rect.top)  * hsy

    const x0 = Math.max(0, Math.round(fx) - 2)
    const y0 = Math.max(0, Math.round(fy) - 2)
    const x1 = Math.min(hidden.width  - 1, Math.round(fx) + 2)
    const y1 = Math.min(hidden.height - 1, Math.round(fy) + 2)

    const data = hidden.getContext('2d')!.getImageData(x0, y0, x1 - x0 + 1, y1 - y0 + 1).data
    onSample(pixelsToHsv(data))
  }

  return (
    <div className="relative">
      {ready && !sampled && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-black/55 text-white text-[12px] px-3 py-1.5 rounded-full pointer-events-none whitespace-nowrap backdrop-blur-sm">
          Survolez puis cliquez sur une marque de correction
        </div>
      )}
      {ready && sampled && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-[#00a63e]/80 text-white text-[12px] px-3 py-1.5 rounded-full pointer-events-none whitespace-nowrap backdrop-blur-sm">
          Couleur sélectionnée — cliquez à nouveau pour changer
        </div>
      )}
      <canvas
        ref={displayRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className="w-full rounded-b-[14px]"
        style={{ cursor: 'crosshair', display: ready ? 'block' : 'none' }}
      />
      <canvas ref={hiddenRef} style={{ display: 'none' }} />
      {!ready && (
        <div className="h-48 flex items-center justify-center text-[13px] text-[#9ca3af]">
          Chargement...
        </div>
      )}
    </div>
  )
}
