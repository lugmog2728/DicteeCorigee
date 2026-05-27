import { apiFetch } from './client'
import type { Niveau } from './dictees'

export interface ClasseApi {
  id:             number
  user_id:        number
  nom:            string
  niveau:         Niveau
  annee_scolaire: string
  nb_eleves:      number
  moyenne:        number | null
  created_at:     string
  updated_at:     string
}

export interface ClasseCreate {
  nom:            string
  niveau:         Niveau
  annee_scolaire?: string
}

export interface EleveStatItem {
  id:                    number
  prenom:                string
  initiale:              string
  dispositif:            string | null
  moyenne:               number | null
  trend:                 number | null
  derniere_dictee_score: number | null
  total_corrections:     number
  derniere_date:         string | null
}

export interface ClasseStats {
  total_eleves:             number
  moyenne_generale:         number | null
  total_dictees_planifiees: number
  eleves_en_difficulte:     number
  eleves:                   EleveStatItem[]
}

export async function getClasses(): Promise<ClasseApi[]> {
  const res = await apiFetch('/api/classes')
  if (!res.ok) throw new Error('Erreur lors du chargement des classes')
  return res.json()
}

export async function getClasse(id: number): Promise<ClasseApi> {
  const res = await apiFetch(`/api/classes/${id}`)
  if (!res.ok) throw new Error('Classe introuvable')
  return res.json()
}

export async function getClasseStats(id: number): Promise<ClasseStats> {
  const res = await apiFetch(`/api/classes/${id}/stats`)
  if (!res.ok) throw new Error('Erreur lors du chargement des statistiques')
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
