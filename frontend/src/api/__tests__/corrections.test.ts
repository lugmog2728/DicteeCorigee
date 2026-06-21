import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getCorrections, createCorrection } from '../corrections'
import type { CorrectionCreate } from '../corrections'

const mockFetch = vi.fn()

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch)
  localStorage.clear()
  mockFetch.mockReset()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

// Helper: build a minimal valid CorrectionCreate payload
function makeCorrectionPayload(overrides: Partial<CorrectionCreate> = {}): CorrectionCreate {
  return {
    dictee_id: 1,
    score: 80,
    nb_errors: 3,
    student_name: 'Marie Dupont',
    counts: {
      conjugaison: 1,
      homophone: 0,
      accord: 2,
      majuscule: 0,
      ponctuation: 0,
      infinitif: 0,
      orthographe: 0,
      nonPresent: 0,
      son: 0,
    },
    ...overrides,
  }
}

// ── getCorrections ─────────────────────────────────────────────────────────────

describe('getCorrections', () => {
  it('calls the correct URL without a planification_id when none is passed', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify([]), { status: 200 }),
    )

    await getCorrections()

    const [url] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(url).toMatch(/\/api\/corrections$/)
    expect(url).not.toContain('planification_id')
  })

  it('appends ?planification_id=X when a planification id is provided', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify([]), { status: 200 }),
    )

    await getCorrections(42)

    const [url] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('?planification_id=42')
  })

  it('returns the parsed JSON array from the response', async () => {
    const payload = [{ id: 1, student_name: 'Alice', score: 90 }]
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify(payload), { status: 200 }),
    )

    const result = await getCorrections()
    expect(result).toEqual(payload)
  })

  it('throws when the server responds with an error status', async () => {
    mockFetch.mockResolvedValueOnce(new Response('Internal error', { status: 500 }))

    await expect(getCorrections()).rejects.toThrow('Erreur lors du chargement des corrections')
  })

  it('includes the Authorization header when a token is in localStorage', async () => {
    localStorage.setItem('token', 'teacher-token')
    mockFetch.mockResolvedValueOnce(new Response('[]', { status: 200 }))

    await getCorrections()

    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect((init.headers as Record<string, string>)['Authorization']).toBe('Bearer teacher-token')
  })
})

// ── createCorrection ───────────────────────────────────────────────────────────

describe('createCorrection', () => {
  it('sends a POST request to /api/corrections', async () => {
    mockFetch.mockResolvedValueOnce(new Response('', { status: 201 }))

    await createCorrection(makeCorrectionPayload())

    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(url).toMatch(/\/api\/corrections$/)
    expect(init.method).toBe('POST')
  })

  it('builds FormData with dictee_id, score, nb_errors, student_name fields', async () => {
    mockFetch.mockResolvedValueOnce(new Response('', { status: 201 }))

    await createCorrection(makeCorrectionPayload({
      dictee_id: 7,
      score: 85,
      nb_errors: 2,
      student_name: 'Jean Martin',
    }))

    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit]
    const fd = init.body as FormData
    expect(fd.get('dictee_id')).toBe('7')
    expect(fd.get('score')).toBe('85')
    expect(fd.get('nb_errors')).toBe('2')
    expect(fd.get('student_name')).toBe('Jean Martin')
  })

  it('appends planification_id to FormData when provided', async () => {
    mockFetch.mockResolvedValueOnce(new Response('', { status: 201 }))

    await createCorrection(makeCorrectionPayload({ planification_id: 99 }))

    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit]
    const fd = init.body as FormData
    expect(fd.get('planification_id')).toBe('99')
  })

  it('does NOT append planification_id when it is undefined', async () => {
    mockFetch.mockResolvedValueOnce(new Response('', { status: 201 }))

    await createCorrection(makeCorrectionPayload({ planification_id: undefined }))

    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit]
    const fd = init.body as FormData
    expect(fd.get('planification_id')).toBeNull()
  })

  it('appends eleve_id to FormData when provided', async () => {
    mockFetch.mockResolvedValueOnce(new Response('', { status: 201 }))

    await createCorrection(makeCorrectionPayload({ eleve_id: 5 }))

    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit]
    const fd = init.body as FormData
    expect(fd.get('eleve_id')).toBe('5')
  })

  it('appends category error counts using the correct field names', async () => {
    mockFetch.mockResolvedValueOnce(new Response('', { status: 201 }))

    await createCorrection(makeCorrectionPayload({
      counts: {
        conjugaison: 3,
        homophone: 1,
        accord: 0,
        majuscule: 2,
        ponctuation: 0,
        infinitif: 0,
        orthographe: 0,
        nonPresent: 0,
        son: 0,
      },
    }))

    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit]
    const fd = init.body as FormData
    expect(fd.get('err_conjugaison')).toBe('3')
    expect(fd.get('err_homophone')).toBe('1')
    expect(fd.get('err_accord')).toBe('0')
    expect(fd.get('err_majuscule')).toBe('2')
    expect(fd.get('err_non_present')).toBe('0')
  })

  it('appends image blob with filename copie.jpg when provided', async () => {
    mockFetch.mockResolvedValueOnce(new Response('', { status: 201 }))

    const image = new Blob(['fake-image'], { type: 'image/jpeg' })
    await createCorrection(makeCorrectionPayload({ image }))

    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit]
    const fd = init.body as FormData
    const file = fd.get('image') as File
    expect(file).not.toBeNull()
    expect(file.name).toBe('copie.jpg')
  })

  it('throws when the server responds with an error status', async () => {
    mockFetch.mockResolvedValueOnce(new Response('Bad request', { status: 400 }))

    await expect(createCorrection(makeCorrectionPayload())).rejects.toThrow(
      'Erreur lors de la sauvegarde de la correction',
    )
  })
})
