const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

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
export type Periode = 'Présent' | 'Passé' | 'Futur'

export interface DicteeApi {
  id:          number
  titre:       string
  niveau:      Niveau
  periode:     Periode
  tag:         string | null
  duree:       number
  description: string | null
  texte:       string
  errors:      ErrorCounts
  created_at:  string
  updated_at:  string
}

export interface DicteeCreate {
  titre:       string
  niveau:      Niveau
  periode:     Periode
  tag?:        string
  duree:       number
  description?: string
  texte:       string
  errors:      ErrorCounts
}

export async function getDictees(params?: { niveau?: string; periode?: string }): Promise<DicteeApi[]> {
  const url = new URL(`${API_URL}/api/dictees`)
  if (params?.niveau)  url.searchParams.set('niveau', params.niveau)
  if (params?.periode) url.searchParams.set('periode', params.periode)
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error('Erreur lors du chargement des dictées')
  return res.json()
}

export async function createDictee(data: DicteeCreate): Promise<DicteeApi> {
  const res = await fetch(`${API_URL}/api/dictees`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Erreur lors de la création de la dictée')
  return res.json()
}

export async function deleteDictee(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/api/dictees/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Erreur lors de la suppression')
}
