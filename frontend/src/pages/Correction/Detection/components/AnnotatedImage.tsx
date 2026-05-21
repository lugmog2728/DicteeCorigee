import { useRef, useState } from 'react'
import type { DetectionResult } from '../../../../api/detection'
import { LETTER_COLOR } from '../../constants'

interface Props {
  previewUrl: string
  detectionResult: DetectionResult
}

export default function AnnotatedImage({ previewUrl, detectionResult }: Props) {
  const imgRef = useRef<HTMLImageElement>(null)
  const [naturalSize, setNaturalSize] = useState({ w: 1, h: 1 })

  function onImgLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    setNaturalSize({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })
  }

  return (
    <div className="flex-1 min-w-0 bg-white border border-[rgba(0,0,0,0.1)] rounded-[14px] p-6 flex flex-col gap-4">
      <p className="text-[16px] font-medium text-[#0a0a0a]">Annotations Détectées</p>
      <div className="bg-[#f3f4f6] rounded-[10px] p-4">
        <div className="relative inline-block w-full">
          <img
            ref={imgRef}
            src={previewUrl}
            alt="Copie analysée"
            className="w-full rounded-[4px] block"
            onLoad={onImgLoad}
          />
          {detectionResult.letters.map((letter, idx) => {
            const color = LETTER_COLOR[letter.letter] ?? '#6b7280'
            return (
              <div
                key={idx}
                className="absolute size-8 rounded-full flex items-center justify-center text-[12px] font-bold text-white -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                style={{
                  left:            `${(letter.x + letter.w / 2) / naturalSize.w * 100}%`,
                  top:             `${(letter.y + letter.h / 2) / naturalSize.h * 100}%`,
                  backgroundColor: color,
                  boxShadow:       '0 4px 6px rgba(0,0,0,0.15)',
                }}
              >
                {letter.letter}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
