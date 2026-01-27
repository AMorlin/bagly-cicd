import { describe, it, expect } from 'vitest'
import { BRAZILIAN_AIRPORTS, getAirportByCode } from './claim.data.js'

describe('BRAZILIAN_AIRPORTS', () => {
  it('should have at least 20 airports', () => {
    expect(BRAZILIAN_AIRPORTS.length).toBeGreaterThanOrEqual(20)
  })

  it('should have valid airport structure', () => {
    for (const airport of BRAZILIAN_AIRPORTS) {
      expect(airport).toHaveProperty('code')
      expect(airport).toHaveProperty('name')
      expect(airport).toHaveProperty('city')
      expect(airport.code).toHaveLength(3)
      expect(airport.name.length).toBeGreaterThan(0)
      expect(airport.city.length).toBeGreaterThan(0)
    }
  })

  it('should have unique airport codes', () => {
    const codes = BRAZILIAN_AIRPORTS.map((a) => a.code)
    const uniqueCodes = new Set(codes)
    expect(uniqueCodes.size).toBe(codes.length)
  })

  it('should include major Brazilian airports', () => {
    const codes = BRAZILIAN_AIRPORTS.map((a) => a.code)
    expect(codes).toContain('GRU') // Guarulhos
    expect(codes).toContain('GIG') // Galeão
    expect(codes).toContain('BSB') // Brasília
    expect(codes).toContain('CGH') // Congonhas
  })
})

describe('getAirportByCode', () => {
  it('should return airport for valid code', () => {
    const airport = getAirportByCode('GRU')
    expect(airport).toBeDefined()
    expect(airport?.code).toBe('GRU')
    expect(airport?.city).toBe('São Paulo')
  })

  it('should return undefined for invalid code', () => {
    const airport = getAirportByCode('XXX')
    expect(airport).toBeUndefined()
  })

  it('should return undefined for empty code', () => {
    const airport = getAirportByCode('')
    expect(airport).toBeUndefined()
  })

  it('should be case-sensitive', () => {
    const airport = getAirportByCode('gru')
    expect(airport).toBeUndefined()
  })

  it('should find all airports by their codes', () => {
    for (const airport of BRAZILIAN_AIRPORTS) {
      const found = getAirportByCode(airport.code)
      expect(found).toBeDefined()
      expect(found?.code).toBe(airport.code)
    }
  })
})
