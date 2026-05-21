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

export async function detectImage(file: File): Promise<DetectionResult> {
  const body = new FormData()
  body.append('file', file)
  const res = await fetch(`${API_URL}/api/detection/detect`, { method: 'POST', body })
  if (!res.ok) throw new Error('Erreur lors de la détection')
  return res.json()
}
