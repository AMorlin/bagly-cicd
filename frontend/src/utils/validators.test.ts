import { describe, it, expect } from 'vitest'
import { validateCPF, formatCPF, formatPhone, maskEmail } from './validators'

describe('validateCPF', () => {
  it('should return true for valid CPF', () => {
    expect(validateCPF('529.982.247-25')).toBe(true)
    expect(validateCPF('52998224725')).toBe(true)
  })

  it('should return false for invalid CPF', () => {
    expect(validateCPF('111.111.111-11')).toBe(false)
    expect(validateCPF('123.456.789-00')).toBe(false)
    expect(validateCPF('12345')).toBe(false)
  })
})

describe('formatCPF', () => {
  it('should format CPF correctly', () => {
    expect(formatCPF('52998224725')).toBe('529.982.247-25')
  })
})

describe('formatPhone', () => {
  it('should format phone with 11 digits', () => {
    expect(formatPhone('11999998888')).toBe('(11) 99999-8888')
  })

  it('should format phone with 10 digits', () => {
    expect(formatPhone('1199998888')).toBe('(11) 9999-8888')
  })
})

describe('maskEmail', () => {
  it('should mask email correctly', () => {
    expect(maskEmail('usuario@email.com')).toBe('usu***@email.com')
    expect(maskEmail('ab@email.com')).toBe('ab***@email.com')
  })
})
