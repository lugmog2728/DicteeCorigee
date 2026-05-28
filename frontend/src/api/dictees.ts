import { apiFetch } from './client'

export interface ErrorCounts {
  conjugaison: number
  homophone:   number
  accord:      number
  majuscule:   number
  ponctuation: number
  infinitif:   number
  orthographe: number
  nonPresent:  number
  son:         number
}

export type Niveau  = 'CP' | 'CE1' | 'CE2' | 'CM1' | 'CM2'
export type Periode = 'P1' | 'P2' | 'P3' | 'P4' | 'P5'
export type Temps   = 'Présent' | 'Imparfait' | 'Passé' | 'Futur'

export interface DicteeApi {
  id:         number
  titre:      string
  niveau:     Niveau
  periode:    Periode
  temps:      Temps | null
  tag:        string | null
  texte:      string
  errors:     ErrorCounts
  created_at: string
  updated_at: string
}

export interface DicteeCreate {
  titre:   string
  niveau:  Niveau
  periode: Periode
  temps:   Temps
  tag?:    string
  texte:   string
  errors:  ErrorCounts
}

export async function getDictees(params?: { niveau?: string; periode?: string }): Promise<DicteeApi[]> {
  const qs = new URLSearchParams()
  if (params?.niveau)  qs.set('niveau', params.niveau)
  if (params?.periode) qs.set('periode', params.periode)
  const query = qs.toString() ? `?${qs}` : ''
  const res = await apiFetch(`/api/dictees${query}`)
  if (!res.ok) throw new Error('Erreur lors du chargement des dictées')
  return res.json()
}

export async function getDictee(id: number): Promise<DicteeApi> {
  const res = await apiFetch(`/api/dictees/${id}`)
  if (!res.ok) throw new Error('Dictée introuvable')
  return res.json()
}

export async function createDictee(data: DicteeCreate): Promise<DicteeApi> {
  const res = await apiFetch('/api/dictees', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Erreur lors de la création de la dictée')
  return res.json()
}

export async function updateDictee(id: number, data: DicteeCreate): Promise<DicteeApi> {
  const res = await apiFetch(`/api/dictees/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Erreur lors de la mise à jour de la dictée')
  return res.json()
}

export async function deleteDictee(id: number): Promise<void> {
  const res = await apiFetch(`/api/dictees/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Erreur lors de la suppression')
}
