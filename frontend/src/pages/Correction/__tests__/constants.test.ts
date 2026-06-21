import { describe, it, expect } from 'vitest'
import {
  CATEGORIES,
  CAT_BY_KEY,
  LETTER_TO_CATEGORY,
  getPerformance,
} from '../constants'

// ── getPerformance ─────────────────────────────────────────────────────────────

describe('getPerformance', () => {
  it('returns Excellent with green colours for 0 errors', () => {
    const result = getPerformance(0)
    expect(result.label).toBe('Excellent')
    expect(result.color).toBe('#16a34a')
    expect(result.bg).toBe('#f0fdf4')
  })

  it('returns Excellent for exactly 0 errors (boundary)', () => {
    expect(getPerformance(0).label).toBe('Excellent')
  })

  it('returns Bien with amber colours for 1 error', () => {
    const result = getPerformance(1)
    expect(result.label).toBe('Bien')
    expect(result.color).toBe('#d97706')
    expect(result.bg).toBe('#fffbeb')
  })

  it('returns Bien for exactly 2 errors (boundary)', () => {
    expect(getPerformance(2).label).toBe('Bien')
  })

  it('returns À travailler with red colours for 3 errors', () => {
    const result = getPerformance(3)
    expect(result.label).toBe('À travailler')
    expect(result.color).toBe('#dc2626')
    expect(result.bg).toBe('#fff1f2')
  })

  it('returns À travailler for large error counts', () => {
    expect(getPerformance(99).label).toBe('À travailler')
  })
})

// ── CATEGORIES ─────────────────────────────────────────────────────────────────

describe('CATEGORIES', () => {
  it('has exactly 9 entries', () => {
    expect(CATEGORIES).toHaveLength(9)
  })

  it('has the C.H.A.M.P.I.O.N.S letters in order', () => {
    const letters = CATEGORIES.map(c => c.letter)
    expect(letters).toEqual(['C', 'H', 'A', 'M', 'P', 'I', 'O', 'N', 'S'])
  })

  it('has the correct key for each letter', () => {
    const expected: Array<[string, string]> = [
      ['C', 'conjugaison'],
      ['H', 'homophone'],
      ['A', 'accord'],
      ['M', 'majuscule'],
      ['P', 'ponctuation'],
      ['I', 'infinitif'],
      ['O', 'orthographe'],
      ['N', 'nonPresent'],
      ['S', 'son'],
    ]
    expected.forEach(([letter, key]) => {
      const cat = CATEGORIES.find(c => c.letter === letter)
      expect(cat).toBeDefined()
      expect(cat!.key).toBe(key)
    })
  })

  it('every entry has a non-empty label', () => {
    CATEGORIES.forEach(cat => {
      expect(cat.label.length).toBeGreaterThan(0)
    })
  })
})

// ── CAT_BY_KEY ─────────────────────────────────────────────────────────────────

describe('CAT_BY_KEY', () => {
  it('maps every CATEGORIES key to the correct category object', () => {
    CATEGORIES.forEach(cat => {
      expect(CAT_BY_KEY[cat.key]).toBe(cat)
    })
  })

  it('has exactly 9 entries (one per category)', () => {
    expect(Object.keys(CAT_BY_KEY)).toHaveLength(9)
  })

  it('conjugaison key maps to letter C', () => {
    expect(CAT_BY_KEY['conjugaison'].letter).toBe('C')
  })

  it('nonPresent key maps to letter N', () => {
    expect(CAT_BY_KEY['nonPresent'].letter).toBe('N')
  })

  it('son key maps to letter S', () => {
    expect(CAT_BY_KEY['son'].letter).toBe('S')
  })
})

// ── LETTER_TO_CATEGORY ─────────────────────────────────────────────────────────

describe('LETTER_TO_CATEGORY', () => {
  const expected: Record<string, string> = {
    C: 'conjugaison',
    H: 'homophone',
    A: 'accord',
    M: 'majuscule',
    P: 'ponctuation',
    I: 'infinitif',
    O: 'orthographe',
    N: 'nonPresent',
    S: 'son',
  }

  it('maps every C.H.A.M.P.I.O.N.S letter to the correct category key', () => {
    Object.entries(expected).forEach(([letter, key]) => {
      expect(LETTER_TO_CATEGORY[letter]).toBe(key)
    })
  })

  it('has exactly 9 entries', () => {
    expect(Object.keys(LETTER_TO_CATEGORY)).toHaveLength(9)
  })

  it('C maps to conjugaison', () => {
    expect(LETTER_TO_CATEGORY['C']).toBe('conjugaison')
  })

  it('S maps to son', () => {
    expect(LETTER_TO_CATEGORY['S']).toBe('son')
  })

  it('each value is a valid CATEGORIES key', () => {
    const validKeys = new Set(CATEGORIES.map(c => c.key))
    Object.values(LETTER_TO_CATEGORY).forEach(key => {
      expect(validKeys.has(key as never)).toBe(true)
    })
  })
})
