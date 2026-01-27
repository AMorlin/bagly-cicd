import { describe, it, expect } from 'vitest'
import { validateCPF, generateOTP, maskEmail } from './validators.js'

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

describe('generateOTP', () => {
  it('should generate a 6-digit OTP', () => {
    const otp = generateOTP()
    expect(otp).toHaveLength(6)
    expect(/^\d{6}$/.test(otp)).toBe(true)
  })
})

describe('maskEmail', () => {
  it('should mask email correctly', () => {
    expect(maskEmail('usuario@email.com')).toBe('usu***@email.com')
    expect(maskEmail('ab@email.com')).toBe('ab***@email.com')
  })
})
