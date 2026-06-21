import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getToken, apiFetch } from '../client'

// apiFetch calls global fetch, so we stub it at the global level.
const mockFetch = vi.fn()

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch)
  localStorage.clear()
  mockFetch.mockReset()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

// ── getToken ───────────────────────────────────────────────────────────────────

describe('getToken', () => {
  it('returns null when localStorage has no token', () => {
    expect(getToken()).toBeNull()
  })

  it('returns the token stored in localStorage', () => {
    localStorage.setItem('token', 'abc123')
    expect(getToken()).toBe('abc123')
  })

  it('returns null after token is removed from localStorage', () => {
    localStorage.setItem('token', 'will-be-removed')
    localStorage.removeItem('token')
    expect(getToken()).toBeNull()
  })
})

// ── apiFetch ───────────────────────────────────────────────────────────────────

describe('apiFetch', () => {
  const fakeResponse = new Response('{}', { status: 200 })

  it('adds Authorization header when a token is present in localStorage', async () => {
    localStorage.setItem('token', 'my-jwt-token')
    mockFetch.mockResolvedValueOnce(fakeResponse)

    await apiFetch('/api/test')

    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect((init.headers as Record<string, string>)['Authorization']).toBe('Bearer my-jwt-token')
  })

  it('does NOT include Authorization header when no token is stored', async () => {
    mockFetch.mockResolvedValueOnce(fakeResponse)

    await apiFetch('/api/test')

    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect((init.headers as Record<string, string>)['Authorization']).toBeUndefined()
  })

  it('always sends Content-Type: application/json', async () => {
    mockFetch.mockResolvedValueOnce(fakeResponse)

    await apiFetch('/api/test')

    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect((init.headers as Record<string, string>)['Content-Type']).toBe('application/json')
  })

  it('calls fetch with the correct full URL', async () => {
    mockFetch.mockResolvedValueOnce(fakeResponse)

    await apiFetch('/api/something')

    const [url] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(url).toMatch(/\/api\/something$/)
  })

  it('forwards extra init options (method, body) to fetch', async () => {
    mockFetch.mockResolvedValueOnce(fakeResponse)

    await apiFetch('/api/resource', { method: 'POST', body: JSON.stringify({ x: 1 }) })

    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(init.method).toBe('POST')
    expect(init.body).toBe(JSON.stringify({ x: 1 }))
  })

  it('returns the fetch Response object', async () => {
    const expected = new Response('hello', { status: 201 })
    mockFetch.mockResolvedValueOnce(expected)

    const result = await apiFetch('/api/resource')
    expect(result).toBe(expected)
  })
})
