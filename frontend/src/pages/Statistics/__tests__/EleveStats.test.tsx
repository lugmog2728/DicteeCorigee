import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { render } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import EleveStats from '../EleveStats'
import type { CorrectionRead } from '../../../api/corrections'
import type { DicteeApi } from '../../../api/dictees'

// ── Module mocks ───────────────────────────────────────────────────────────────

vi.mock('../../../api/corrections', () => ({
  getCorrections: vi.fn(),
}))

vi.mock('../../../api/dictees', () => ({
  getDictees: vi.fn(),
}))

vi.mock('../../../api/classes', () => ({
  getClasseStats: vi.fn(),
}))

import { getCorrections } from '../../../api/corrections'
import { getDictees } from '../../../api/dictees'
import { getClasseStats } from '../../../api/classes'

const mockedGetCorrections = vi.mocked(getCorrections)
const mockedGetDictees = vi.mocked(getDictees)
const mockedGetClasseStats = vi.mocked(getClasseStats)

// ── Fixtures ───────────────────────────────────────────────────────────────────

const ELEVE_ID = 7

function makeCorrection(overrides: Partial<CorrectionRead> = {}): CorrectionRead {
  return {
    id: 1,
    eleve_id: ELEVE_ID,
    planification_id: null,
    dictee_id: 1,
    student_name: 'Lucie Bernard',
    score: 85,
    nb_errors: 2,
    err_conjugaison: 1,
    err_homophone: 0,
    err_accord: 1,
    err_majuscule: 0,
    err_ponctuation: 0,
    err_infinitif: 0,
    err_orthographe: 0,
    err_non_present: 0,
    err_son: 0,
    created_at: '2026-03-10T09:00:00',
    ...overrides,
  }
}

function makeDictee(overrides: Partial<DicteeApi> = {}): DicteeApi {
  return {
    id: 1,
    titre: 'La forêt enchantée',
    niveau: 'CE2',
    periode: 'P2',
    temps: 'Présent',
    tag: null,
    texte: 'Il était une fois…',
    errors: {
      conjugaison: 1, homophone: 0, accord: 1, majuscule: 0,
      ponctuation: 0, infinitif: 0, orthographe: 0, nonPresent: 0, son: 0,
    },
    created_at: '2026-01-01T00:00:00',
    updated_at: '2026-01-01T00:00:00',
    ...overrides,
  }
}

const defaultState = {
  nom: 'Lucie Bernard',
  dispositif: null,
  classeNom: 'CE2 A',
  classeId: 3,
  eleve: { moyenne: 85, trend: 5, derniere_dictee_score: 85, derniere_date: '2026-03-10T09:00:00' },
}

function renderPage(state = defaultState, eleveId = String(ELEVE_ID)) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: `/eleve/${eleveId}/stats`, state }]}>
      <Routes>
        <Route path="/eleve/:eleveId/stats" element={<EleveStats />} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  // Default: happy-path mocks
  mockedGetCorrections.mockResolvedValue([makeCorrection()])
  mockedGetDictees.mockResolvedValue([makeDictee()])
  mockedGetClasseStats.mockResolvedValue({
    total_eleves: 20,
    moyenne_generale: 78,
    total_dictees_planifiees: 5,
    eleves_en_difficulte: 2,
    eleves: [{ id: ELEVE_ID, prenom: 'Lucie', initiale: 'B', dispositif: null, moyenne: 85, trend: 5, derniere_dictee_score: 85, total_corrections: 1, derniere_date: '2026-03-10T09:00:00' }],
  })
})

// ── Loading state ──────────────────────────────────────────────────────────────

describe('EleveStats — loading state', () => {
  it('shows "Chargement…" while data is being fetched', () => {
    mockedGetCorrections.mockReturnValue(new Promise(() => undefined))

    renderPage()

    expect(screen.getByText('Chargement…')).toBeInTheDocument()
  })
})

// ── Header / student name ──────────────────────────────────────────────────────

describe('EleveStats — header', () => {
  it('renders the student name from location state as the page heading', async () => {
    renderPage()

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /lucie bernard/i })).toBeInTheDocument()
    })
  })

  it('falls back to "Élève #<id>" when no name is in state', async () => {
    mockedGetCorrections.mockResolvedValue([])
    mockedGetDictees.mockResolvedValue([])
    mockedGetClasseStats.mockRejectedValue(new Error('no stats'))

    renderPage({ ...defaultState, nom: undefined as unknown as string }, '42')

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /élève #42/i })).toBeInTheDocument()
    })
  })

  it('shows the class name badge', async () => {
    renderPage()

    await waitFor(() => {
      // "CE2 A" appears at least once (badge + back button text are both acceptable)
      expect(screen.getAllByText('CE2 A').length).toBeGreaterThanOrEqual(1)
    })
  })
})

// ── Empty state ────────────────────────────────────────────────────────────────

describe('EleveStats — empty state', () => {
  beforeEach(() => {
    // Return corrections for OTHER students only → this student has none
    mockedGetCorrections.mockResolvedValue([
      makeCorrection({ eleve_id: 999, id: 99 }),
    ])
  })

  it('shows "Aucune correction enregistrée" in the history table', async () => {
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Aucune correction enregistrée')).toBeInTheDocument()
    })
  })
})

// ── Stat cards ─────────────────────────────────────────────────────────────────

describe('EleveStats — stat cards', () => {
  beforeEach(() => {
    mockedGetCorrections.mockResolvedValue([
      makeCorrection({ id: 1, score: 85, created_at: '2026-03-10T09:00:00' }),
      makeCorrection({ id: 2, score: 70, created_at: '2026-04-05T09:00:00' }),
    ])
  })

  it('renders the "Moyenne Générale" stat card', async () => {
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Moyenne Générale')).toBeInTheDocument()
    })
  })

  it('renders the "Dernière Note" stat card', async () => {
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Dernière Note')).toBeInTheDocument()
    })
  })

  it('renders the "Total Dictées" stat card', async () => {
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Total Dictées')).toBeInTheDocument()
    })
  })

  it('renders the "Dernière Activité" stat card', async () => {
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Dernière Activité')).toBeInTheDocument()
    })
  })

  it('shows the computed average score', async () => {
    renderPage()

    // moyenne of 85 and 70 = 78%  (Math.round((85+70)/2) = 78)
    await waitFor(() => {
      expect(screen.getByText('78%')).toBeInTheDocument()
    })
  })

  it('shows the last correction score', async () => {
    renderPage()

    // Latest correction (sorted by created_at) = id 2, score 70
    // It appears in both the stat card AND possibly other UI — check at least once
    await waitFor(() => {
      expect(screen.getAllByText('70%').length).toBeGreaterThanOrEqual(1)
    })
  })

  it('shows the total number of dictées', async () => {
    renderPage()

    await waitFor(() => {
      // The "Total Dictées" card shows 2 — may also appear elsewhere
      expect(screen.getAllByText('2').length).toBeGreaterThanOrEqual(1)
    })
  })
})
