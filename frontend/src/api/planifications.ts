import { apiFetch } from './client'

export type Statut = 'planifiee' | 'en_cours' | 'terminee'

export interface PlanificationDetail {
  id:                number
  date_prevue:       string
  nb_corriges:       number
  statut:            Statut
  types_neutralises: string[]
  dictee_id:         number
  dictee_titre:      string
  dictee_tag:        string | null
  dictee_niveau:     string
  dictee_temps:      string | null
  classe_id:         number
  classe_nom:        string
  classe_niveau:     string
  nb_eleves:         number
}

export interface PlanificationStats {
  cette_semaine:   number
  en_attente:      number
  classes_actives: number
  taux_completion: number
}

export interface PlanificationCreate {
  classe_id:         number
  dictee_id:         number
  date_prevue:       string
  types_neutralises: string[]
}

export async function getPlanifications(): Promise<PlanificationDetail[]> {
  const res = await apiFetch('/api/planifications')
  if (!res.ok) throw new Error('Erreur lors du chargement des planifications')
  return res.json()
}

export async function getPlanificationStats(): Promise<PlanificationStats> {
  const res = await apiFetch('/api/planifications/stats')
  if (!res.ok) throw new Error('Erreur lors du chargement des statistiques')
  return res.json()
}

export async function createPlanification(data: PlanificationCreate): Promise<PlanificationDetail> {
  const res = await apiFetch('/api/planifications', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Erreur lors de la création de la planification')
  return res.json()
}

export async function updateNbCorriges(id: number, nb_corriges: number): Promise<void> {
  const res = await apiFetch(`/api/planifications/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ nb_corriges }),
  })
  if (!res.ok) throw new Error('Erreur lors de la mise à jour')
}

export async function deletePlanification(id: number): Promise<void> {
  const res = await apiFetch(`/api/planifications/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Erreur lors de la suppression')
}
