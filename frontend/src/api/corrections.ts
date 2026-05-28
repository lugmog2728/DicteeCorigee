import { API_URL, getToken } from './client'
import type { CategoryKey } from '../pages/Correction/constants'

const CAT_FIELD: Record<CategoryKey, string> = {
  conjugaison: 'err_conjugaison',
  homophone:   'err_homophone',
  accord:      'err_accord',
  majuscule:   'err_majuscule',
  ponctuation: 'err_ponctuation',
  infinitif:   'err_infinitif',
  orthographe: 'err_orthographe',
  nonPresent:  'err_non_present',
  son:         'err_son',
}

export interface CorrectionCreate {
  dictee_id:        number
  score:            number
  nb_errors:        number
  student_name:     string
  counts:           Record<CategoryKey, number>
  planification_id?: number
  eleve_id?:         number
  image?:            Blob
}

export interface CorrectionRead {
  id:               number
  eleve_id:         number | null
  planification_id: number | null
  dictee_id:        number
  student_name:     string
  score:            number
  nb_errors:        number
  err_conjugaison:  number
  err_homophone:    number
  err_accord:       number
  err_majuscule:    number
  err_ponctuation:  number
  err_infinitif:    number
  err_orthographe:  number
  err_non_present:  number
  err_son:          number
}

export async function getCorrections(planificationId?: number): Promise<CorrectionRead[]> {
  const qs = planificationId != null ? `?planification_id=${planificationId}` : ''
  const token = getToken()
  const res = await fetch(`${API_URL}/api/corrections${qs}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!res.ok) throw new Error('Erreur lors du chargement des corrections')
  return res.json()
}

export async function createCorrection(data: CorrectionCreate): Promise<void> {
  const fd = new FormData()
  fd.append('dictee_id',    String(data.dictee_id))
  fd.append('score',        String(data.score))
  fd.append('nb_errors',    String(data.nb_errors))
  fd.append('student_name', data.student_name)
  if (data.planification_id != null) fd.append('planification_id', String(data.planification_id))
  if (data.eleve_id         != null) fd.append('eleve_id',         String(data.eleve_id))
  if (data.image)                    fd.append('image', data.image, 'copie.jpg')

  for (const [catKey, fieldName] of Object.entries(CAT_FIELD)) {
    fd.append(fieldName, String(data.counts[catKey as CategoryKey] ?? 0))
  }

  const token = getToken()
  const res = await fetch(`${API_URL}/api/corrections`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: fd,
  })
  if (!res.ok) throw new Error('Erreur lors de la sauvegarde de la correction')
}
