export const STEPS = ['Téléverser', 'Détection', 'Validation'] as const

export const CATEGORIES = [
  { key: 'conjugaison', letter: 'C', label: 'Conjugaison',  color: 'var(--ocean-blue-500)',    bg: 'rgba(0,145,173,0.08)' },
  { key: 'homophone',   letter: 'H', label: 'Homophone',    color: 'var(--aqua-mist-600)',     bg: 'rgba(88,213,213,0.08)' },
  { key: 'accord',      letter: 'A', label: 'Accord',       color: 'var(--electric-pink-500)', bg: 'rgba(255,55,187,0.08)' },
  { key: 'majuscule',   letter: 'M', label: 'Majuscule',    color: 'var(--soft-blush-900)',    bg: 'rgba(255,202,126,0.08)' },
  { key: 'ponctuation', letter: 'P', label: 'Ponctuation',  color: 'var(--sunlight-sand-700)', bg: 'rgba(224,203,105,0.08)' },
  { key: 'infinitif',   letter: 'I', label: 'Infinitif',    color: 'var(--ocean-blue-300)',    bg: 'rgba(86,186,206,0.08)' },
  { key: 'orthographe', letter: 'O', label: 'Orthographe',  color: 'var(--electric-pink-700)', bg: 'rgba(171,52,123,0.08)' },
  { key: 'nonPresent',  letter: 'N', label: 'Non présent',  color: 'var(--aqua-mist-700)',     bg: 'rgba(67,175,176,0.08)' },
  { key: 'son',         letter: 'S', label: 'Son',          color: 'var(--sunlight-sand-800)', bg: 'rgba(213,188,76,0.08)' },
] as const

export type CategoryKey = typeof CATEGORIES[number]['key']
export type Category = typeof CATEGORIES[number]

export const CAT_BY_KEY = Object.fromEntries(
  CATEGORIES.map(c => [c.key, c])
) as Record<CategoryKey, Category>

export const LETTER_TO_CATEGORY: Record<string, CategoryKey> = {
  C: 'conjugaison', H: 'homophone', A: 'accord', M: 'majuscule',
  P: 'ponctuation', I: 'infinitif', O: 'orthographe', N: 'nonPresent', S: 'son',
}

export const LETTER_COLOR: Record<string, string> = Object.fromEntries(
  CATEGORIES.map(c => [c.letter, c.color])
)

export interface ErrorItem {
  id: number
  letter: string
  category: CategoryKey
  confidence: number
  x: number
  y: number
  w: number
  h: number
  status: 'pending' | 'validated' | 'rejected'
}

// Shared performance helper used in CategorySummary and DetailedScoreGrid
export function getPerformance(count: number) {
  if (count === 0) return { label: 'Excellent',     color: '#16a34a', bg: '#f0fdf4' }
  if (count <= 2)  return { label: 'Bien',          color: '#d97706', bg: '#fffbeb' }
  return                   { label: 'À travailler', color: '#dc2626', bg: '#fff1f2' }
}

// Shared confidence helper used in ErrorCard
export function getConfidenceStyle(confidence: number) {
  const pct = confidence * 100
  if (pct >= 80) return { label: 'Élevée',  color: '#16a34a', bg: '#f0fdf4' }
  if (pct >= 50) return { label: 'Moyenne', color: '#d97706', bg: '#fffbeb' }
  return                 { label: 'Faible',  color: '#dc2626', bg: '#fff1f2' }
}

// Shared navigation state passed between correction steps
import type { DicteeApi } from '../../api/dictees'
import type { DetectionResult } from '../../api/detection'

export interface CorrectionState {
  previewUrl: string
  dictee: DicteeApi
  detectionResult: DetectionResult
  studentName: string
}
