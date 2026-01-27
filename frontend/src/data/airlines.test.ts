import { describe, it, expect } from 'vitest'
import { AIRLINES } from './airlines'

describe('AIRLINES', () => {
  it('should have at least 5 airlines', () => {
    expect(AIRLINES.length).toBeGreaterThanOrEqual(5)
  })

  it('should have valid airline structure', () => {
    for (const airline of AIRLINES) {
      expect(airline).toHaveProperty('value')
      expect(airline).toHaveProperty('label')
      expect(airline.value.length).toBeGreaterThan(0)
      expect(airline.label.length).toBeGreaterThan(0)
    }
  })

  it('should have unique airline values', () => {
    const values = AIRLINES.map((a) => a.value)
    const uniqueValues = new Set(values)
    expect(uniqueValues.size).toBe(values.length)
  })

  it('should include major Brazilian airlines', () => {
    const values = AIRLINES.map((a) => a.value)
    expect(values).toContain('GOL')
    expect(values).toContain('LATAM')
    expect(values).toContain('AZUL')
  })

  it('should have OTHER option for other airlines', () => {
    const other = AIRLINES.find((a) => a.value === 'OTHER')
    expect(other).toBeDefined()
    expect(other?.label).toBe('Outra')
  })

  it('should have readable labels', () => {
    const gol = AIRLINES.find((a) => a.value === 'GOL')
    expect(gol?.label).toBe('Gol Linhas Aéreas')

    const latam = AIRLINES.find((a) => a.value === 'LATAM')
    expect(latam?.label).toBe('LATAM Airlines')

    const azul = AIRLINES.find((a) => a.value === 'AZUL')
    expect(azul?.label).toBe('Azul Linhas Aéreas')
  })

  it('should have uppercase values', () => {
    for (const airline of AIRLINES) {
      expect(airline.value).toBe(airline.value.toUpperCase())
    }
  })
})
