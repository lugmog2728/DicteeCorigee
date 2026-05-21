import { useEffect, useRef, useState } from 'react'
import { CAT_BY_KEY } from '../../constants'
import type { ErrorItem } from '../../constants'

interface Props {
  previewUrl: string
  errors: ErrorItem[]
  currentError: ErrorItem | null
  validatedCount: number
  totalCount: number
}

function computeCrop(error: ErrorItem, naturalW: number, naturalH: number) {
  const pad = Math.max(error.w, error.h) * 1.5 + 50
  const x = Math.max(0, error.x - pad)
  const y = Math.max(0, error.y - pad)
  const r = Math.min(naturalW, error.x + error.w + pad)
  const b = Math.min(naturalH, error.y + error.h + pad)
  return { x, y, w: r - x, h: b - y }
}

export default function AnnotatedImage({ previewUrl, errors, currentError, validatedCount, totalCount }: Props) {
  const hiddenImgRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [naturalSize, setNaturalSize] = useState({ w: 1, h: 1 })
  const [showFullImage, setShowFullImage] = useState(false)

  useEffect(() => {
    if (!showFullImage) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowFullImage(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [showFullImage])

  function onImgLoad() {
    const img = hiddenImgRef.current
    if (img) setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight })
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const img = hiddenImgRef.current
    if (!canvas || !img || !currentError || naturalSize.w <= 1) return

    const cat = CAT_BY_KEY[currentError.category]
    const crop = computeCrop(currentError, naturalSize.w, naturalSize.h)

    const W = 900
    const H = Math.round(W * crop.h / crop.w)
    canvas.width = W
    canvas.height = H

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(img, crop.x, crop.y, crop.w, crop.h, 0, 0, W, H)

    const scale = W / crop.w
    const bx = (currentError.x - crop.x) * scale
    const by = (currentError.y - crop.y) * scale
    const bw = currentError.w * scale
    const bh = currentError.h * scale

    // CSS variables aren't supported in canvas — resolve to actual color value
    let resolvedColor = cat.color
    if (resolvedColor.startsWith('var(')) {
      const varName = resolvedColor.slice(4, -1).trim()
      resolvedColor = getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || '#666'
    }

    ctx.strokeStyle = resolvedColor
    ctx.lineWidth = 3
    ctx.strokeRect(bx, by, bw, bh)
    ctx.save()
    ctx.globalAlpha = 0.16
    ctx.fillStyle = resolvedColor
    ctx.fillRect(bx, by, bw, bh)
    ctx.restore()

    const badgeR = 14
    ctx.beginPath()
    ctx.arc(bx + bw, by, badgeR, 0, Math.PI * 2)
    ctx.fillStyle = resolvedColor
    ctx.fill()
    ctx.fillStyle = 'white'
    ctx.font = 'bold 13px system-ui'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(currentError.letter, bx + bw, by)
  }, [currentError, naturalSize])

  return (
    <div className="flex-1 min-w-0 bg-white border border-[rgba(0,0,0,0.1)] rounded-[14px] p-6 flex flex-col gap-3">
      <img ref={hiddenImgRef} src={previewUrl} className="hidden" onLoad={onImgLoad} alt="" />

      <div className="flex items-center justify-between">
        <p className="text-[16px] font-medium text-[#0a0a0a]">Copie de l'Élève</p>
        <span className="text-[14px] text-[#6a7282]">{validatedCount} / {totalCount} validées</span>
      </div>

      {/* Crop zoomé via canvas + miniature superposée dans le coin inférieur droit */}
      <div className="relative bg-[#f3f4f6] rounded-[10px] overflow-hidden">
        {currentError ? (
          <canvas ref={canvasRef} className="w-full block" />
        ) : (
          <div className="p-10 flex items-center justify-center text-[14px] text-[#6a7282]">
            Toutes les erreurs ont été traitées
          </div>
        )}

        {naturalSize.w > 1 && (() => {
          const thumbH = 88
          const scale = thumbH / naturalSize.h
          const thumbW = Math.round(naturalSize.w * scale)
          const invPx = Math.round(1 / scale)
          return (
            <div
              className="absolute bottom-2 right-2 overflow-hidden rounded-[6px] shadow-lg cursor-pointer"
              style={{ height: thumbH, width: thumbW, border: '1.5px solid rgba(255,255,255,0.6)' }}
              onClick={() => setShowFullImage(true)}
              title="Voir la copie complète"
            >
              <div
                className="absolute top-0 left-0 origin-top-left"
                style={{ width: naturalSize.w, height: naturalSize.h, transform: `scale(${scale})` }}
              >
                <img src={previewUrl} alt="" className="w-full h-full block" />
                {errors.filter(e => e.status !== 'rejected').map(err => {
                  const cat = CAT_BY_KEY[err.category]
                  const isCurrent = err.id === currentError?.id
                  return (
                    <div
                      key={err.id}
                      className="absolute pointer-events-none"
                      style={{
                        left:    err.x,
                        top:     err.y,
                        width:   err.w,
                        height:  err.h,
                        border:  `${invPx}px solid ${cat.color}`,
                        opacity: isCurrent ? 1 : 0.45,
                      }}
                    />
                  )
                })}
                {currentError && (() => {
                  const crop = computeCrop(currentError, naturalSize.w, naturalSize.h)
                  return (
                    <div
                      className="absolute pointer-events-none"
                      style={{
                        left:            crop.x,
                        top:             crop.y,
                        width:           crop.w,
                        height:          crop.h,
                        border:          `${Math.round(invPx * 1.5)}px solid rgba(0,0,0,0.6)`,
                        backgroundColor: 'rgba(0,0,0,0.05)',
                      }}
                    />
                  )
                })()}
              </div>
            </div>
          )
        })()}
      </div>

      {/* Lightbox — copie complète avec toutes les erreurs */}
      {showFullImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/75"
          onClick={() => setShowFullImage(false)}
        >
          <div
            className="relative w-full max-w-3xl max-h-[88vh] overflow-y-auto rounded-[12px] bg-white shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute top-3 right-3 z-10 size-8 rounded-full bg-black/40 hover:bg-black/60 text-white text-lg leading-none flex items-center justify-center transition-colors"
              onClick={() => setShowFullImage(false)}
            >
              ×
            </button>
            <div className="relative w-full" style={{ paddingTop: `${naturalSize.h / naturalSize.w * 100}%` }}>
              <img src={previewUrl} alt="" className="absolute inset-0 w-full h-full" />
              {currentError && (() => {
                const crop = computeCrop(currentError, naturalSize.w, naturalSize.h)
                const rawColor = CAT_BY_KEY[currentError.category].color
                const varName = rawColor.startsWith('var(') ? rawColor.slice(4, -1).trim() : null
                const resolved = varName
                  ? getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || '#666'
                  : rawColor
                return (
                  <div
                    className="absolute pointer-events-none"
                    style={{
                      left:            `${crop.x / naturalSize.w * 100}%`,
                      top:             `${crop.y / naturalSize.h * 100}%`,
                      width:           `${crop.w / naturalSize.w * 100}%`,
                      height:          `${crop.h / naturalSize.h * 100}%`,
                      border:          '2px solid white',
                      boxShadow:       `0 0 0 2px ${resolved}, inset 0 0 0 2px ${resolved}`,
                      backgroundColor: `${resolved}25`,
                    }}
                  />
                )
              })()}
              {errors.filter(e => e.status === 'validated').map(err => {
                const cat = CAT_BY_KEY[err.category]
                return (
                  <div
                    key={err.id}
                    className="absolute pointer-events-none flex items-center justify-center rounded-full text-white font-bold"
                    style={{
                      left:            `${(err.x + err.w / 2) / naturalSize.w * 100}%`,
                      top:             `${(err.y + err.h / 2) / naturalSize.h * 100}%`,
                      width:           28,
                      height:          28,
                      fontSize:        13,
                      transform:       'translate(-50%, -50%)',
                      backgroundColor: cat.color,
                      boxShadow:       '0 1px 4px rgba(0,0,0,0.35)',
                    }}
                  >
                    {err.letter}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
