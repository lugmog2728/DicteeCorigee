import { apiFetch } from './client'

export interface EleveApi {
  id:         number
  classe_id:  number
  user_id:    number
  prenom:     string
  initiale:   string
  dispositif: string | null
  created_at: string
  updated_at: string
}

export interface EleveCreate {
  classe_id:  number
  prenom:     string
  initiale:   string
  dispositif?: string
}

export async function getEleves(classeId: number): Promise<EleveApi[]> {
  const res = await apiFetch(`/api/eleves?classe_id=${classeId}`)
  if (!res.ok) throw new Error('Erreur lors du chargement des élèves')
  return res.json()
}

export async function createEleves(eleves: EleveCreate[]): Promise<EleveApi[]> {
  const res = await apiFetch('/api/eleves/batch', {
    method: 'POST',
    body: JSON.stringify({ eleves }),
  })
  if (!res.ok) throw new Error('Erreur lors de la création des élèves')
  return res.json()
}

export async function deleteEleve(id: number): Promise<void> {
  const res = await apiFetch(`/api/eleves/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Erreur lors de la suppression')
}
