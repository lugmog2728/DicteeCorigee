import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { render } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import PlanificationStats from '../PlanificationStats'
import type { CorrectionRead } from '../../../api/corrections'

// ── Module mock ────────────────────────────────────────────────────────────────

vi.mock('../../../api/corrections', () => ({
  getCorrections: vi.fn(),
}))

import { getCorrections } from '../../../api/corrections'

const mockedGetCorrections = vi.mocked(getCorrections)

// ── Fixtures ───────────────────────────────────────────────────────────────────

function makeCorrection(overrides: Partial<CorrectionRead> = {}): CorrectionRead {
  return {
    id: 1,
    eleve_id: null,
    planification_id: 10,
    dictee_id: 1,
    student_name: 'Alice Martin',
    score: 80,
    nb_errors: 3,
    err_conjugaison: 1,
    err_homophone: 0,
    err_accord: 2,
    err_majuscule: 0,
    err_ponctuation: 0,
    err_infinitif: 0,
    err_orthographe: 0,
    err_non_present: 0,
    err_son: 0,
    created_at: '2026-05-01T10:00:00',
    ...overrides,
  }
}

const defaultState = {
  titre: 'Les animaux de la ferme',
  classe: 'CE2 A',
  classeId: 3,
  nbEleves: 5,
  datePrevue: '2026-05-15',
  niveau: 'CE2',
  nbCorriges: 3,
}

function renderPage(state = defaultState) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/planif/10/stats', state }]}>
      <Routes>
        <Route path="/planif/:planifId/stats" element={<PlanificationStats />} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ── Loading state ──────────────────────────────────────────────────────────────

describe('PlanificationStats — loading state', () => {
  it('shows "Chargement…" while data is being fetched', () => {
    // Never resolve so we stay in loading state
    mockedGetCorrections.mockReturnValue(new Promise(() => undefined))

    renderPage()

    expect(screen.getByText('Chargement…')).toBeInTheDocument()
  })
})

// ── Empty state ────────────────────────────────────────────────────────────────

describe('PlanificationStats — empty state', () => {
  beforeEach(() => {
    mockedGetCorrections.mockResolvedValue([])
  })

  it('shows "Aucune correction enregistrée" in the table when there are no corrections', async () => {
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Aucune correction enregistrée')).toBeInTheDocument()
    })
  })

  it('still renders the stat cards with placeholder dashes', async () => {
    renderPage()

    await waitFor(() => {
      // All four stat cards show '—' for their main value when no data
      const dashes = screen.getAllByText('—')
      expect(dashes.length).toBeGreaterThanOrEqual(2)
    })
  })
})

// ── Stat cards ─────────────────────────────────────────────────────────────────

describe('PlanificationStats — stat cards', () => {
  beforeEach(() => {
    mockedGetCorrections.mockResolvedValue([
      makeCorrection({ id: 1, student_name: 'Alice', score: 90, nb_errors: 1 }),
      makeCorrection({ id: 2, student_name: 'Bob',   score: 60, nb_errors: 5 }),
    ])
  })

  it('renders the "Moyenne de Classe" stat card title', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('Moyenne de Classe')).toBeInTheDocument()
    })
  })

  it('renders the "Meilleure Note" stat card title', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('Meilleure Note')).toBeInTheDocument()
    })
  })

  it('renders the "Élèves Corrigés" stat card title', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('Élèves Corrigés')).toBeInTheDocument()
    })
  })

  it('renders the "Taux de Complétion" stat card title', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('Taux de Complétion')).toBeInTheDocument()
    })
  })

  it('shows the correct best score value', async () => {
    renderPage()
    await waitFor(() => {
      // 90% appears in both the stat card and the results table row — either is fine
      expect(screen.getAllByText('90%').length).toBeGreaterThanOrEqual(1)
    })
  })

  it('shows the correct number of corrected students', async () => {
    renderPage()
    await waitFor(() => {
      // "2" appears in the "Élèves Corrigés" stat card (and possibly elsewhere)
      expect(screen.getAllByText('2').length).toBeGreaterThanOrEqual(1)
    })
  })
})

// ── Results table ──────────────────────────────────────────────────────────────

describe('PlanificationStats — results table', () => {
  const corrections = [
    makeCorrection({ id: 1, student_name: 'Alice',   score: 90, nb_errors: 1 }),
    makeCorrection({ id: 2, student_name: 'Bob',     score: 75, nb_errors: 3 }),
    makeCorrection({ id: 3, student_name: 'Charlie', score: 55, nb_errors: 7 }),
  ]

  beforeEach(() => {
    mockedGetCorrections.mockResolvedValue(corrections)
  })

  it('renders one row per correction', async () => {
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument()
      expect(screen.getByText('Bob')).toBeInTheDocument()
      expect(screen.getByText('Charlie')).toBeInTheDocument()
    })
  })

  it('displays scores sorted descending (best first)', async () => {
    renderPage()

    await waitFor(() => {
      const rows = screen.getAllByRole('row')
      // rows[0] is the thead row, data rows start at index 1
      const dataRows = rows.slice(1)
      const firstRowText = dataRows[0].textContent ?? ''
      const lastRowText = dataRows[dataRows.length - 1].textContent ?? ''
      expect(firstRowText).toContain('Alice')
      expect(lastRowText).toContain('Charlie')
    })
  })

  it('shows the session page title from location state', async () => {
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Les animaux de la ferme')).toBeInTheDocument()
    })
  })

  it('shows the class name from location state', async () => {
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('CE2 A')).toBeInTheDocument()
    })
  })
})
