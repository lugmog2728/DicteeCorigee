const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export interface DetectedLetter {
  letter: string
  confidence: number
  x: number
  y: number
  w: number
  h: number
}

export interface DetectionResult {
  letters: DetectedLetter[]
  count: number
}

export interface TargetHsv { h: number; s: number; v: number }

export async function detectImage(file: File, targetHsv?: TargetHsv): Promise<DetectionResult> {
  const body = new FormData()
  body.append('file', file)
  if (targetHsv) {
    body.append('target_h', String(targetHsv.h))
    body.append('target_s', String(targetHsv.s))
    body.append('target_v', String(targetHsv.v))
  }
  const res = await fetch(`${API_URL}/api/detection/detect`, { method: 'POST', body })
  if (!res.ok) throw new Error('Erreur lors de la détection')
  return res.json()
}
