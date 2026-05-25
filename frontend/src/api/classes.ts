import { apiFetch } from './client'
import type { Niveau } from './dictees'

export interface ClasseApi {
  id:             number
  user_id:        number
  nom:            string
  niveau:         Niveau
  annee_scolaire: string
  nb_eleves:      number
  created_at:     string
  updated_at:     string
}

export interface ClasseCreate {
  nom:            string
  niveau:         Niveau
  annee_scolaire?: string
}

export async function getClasses(): Promise<ClasseApi[]> {
  const res = await apiFetch('/api/classes')
  if (!res.ok) throw new Error('Erreur lors du chargement des classes')
  return res.json()
}

export async function createClasse(data: ClasseCreate): Promise<ClasseApi> {
  const res = await apiFetch('/api/classes', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Erreur lors de la création de la classe')
  return res.json()
}

export async function deleteClasse(id: number): Promise<void> {
  const res = await apiFetch(`/api/classes/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Erreur lors de la suppression')
}
