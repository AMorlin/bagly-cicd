import { describe, it, expect } from 'vitest'
import { validateCPF, generateOTP, maskEmail } from './validators.js'

describe('validateCPF', () => {
  it('should return true for valid CPF with formatting', () => {
    expect(validateCPF('529.982.247-25')).toBe(true)
  })

  it('should return true for valid CPF without formatting', () => {
    expect(validateCPF('52998224725')).toBe(true)
  })

  it('should return true for multiple valid CPFs', () => {
    const validCPFs = [
      '111.444.777-35',
      '123.456.789-09',
      '987.654.321-00',
      '11144477735',
    ]
    for (const cpf of validCPFs) {
      expect(validateCPF(cpf)).toBe(true)
    }
  })

  it('should return false for CPF with all same digits', () => {
    expect(validateCPF('111.111.111-11')).toBe(false)
    expect(validateCPF('000.000.000-00')).toBe(false)
    expect(validateCPF('222.222.222-22')).toBe(false)
    expect(validateCPF('333.333.333-33')).toBe(false)
    expect(validateCPF('444.444.444-44')).toBe(false)
    expect(validateCPF('555.555.555-55')).toBe(false)
    expect(validateCPF('666.666.666-66')).toBe(false)
    expect(validateCPF('777.777.777-77')).toBe(false)
    expect(validateCPF('888.888.888-88')).toBe(false)
    expect(validateCPF('999.999.999-99')).toBe(false)
  })

  it('should return false for invalid CPF checksum', () => {
    expect(validateCPF('123.456.789-00')).toBe(false)
    expect(validateCPF('529.982.247-26')).toBe(false)
  })

  it('should return false for CPF with wrong length', () => {
    expect(validateCPF('12345')).toBe(false)
    expect(validateCPF('123456789012')).toBe(false)
    expect(validateCPF('')).toBe(false)
  })

  it('should return false for CPF with letters', () => {
    expect(validateCPF('123.456.789-AB')).toBe(false)
    expect(validateCPF('ABC.DEF.GHI-JK')).toBe(false)
  })

  it('should handle CPF with different separators', () => {
    expect(validateCPF('529-982-247/25')).toBe(true)
    expect(validateCPF('529 982 247 25')).toBe(true)
  })
})

describe('generateOTP', () => {
  it('should generate a 6-digit OTP', () => {
    const otp = generateOTP()
    expect(otp).toHaveLength(6)
    expect(/^\d{6}$/.test(otp)).toBe(true)
  })

  it('should generate numeric only OTP', () => {
    for (let i = 0; i < 10; i++) {
      const otp = generateOTP()
      expect(Number.isNaN(Number(otp))).toBe(false)
    }
  })

  it('should generate OTP >= 100000', () => {
    for (let i = 0; i < 10; i++) {
      const otp = generateOTP()
      expect(Number.parseInt(otp, 10)).toBeGreaterThanOrEqual(100000)
    }
  })

  it('should generate OTP <= 999999', () => {
    for (let i = 0; i < 10; i++) {
      const otp = generateOTP()
      expect(Number.parseInt(otp, 10)).toBeLessThanOrEqual(999999)
    }
  })

  it('should generate different OTPs on multiple calls', () => {
    const otps = new Set<string>()
    for (let i = 0; i < 100; i++) {
      otps.add(generateOTP())
    }
    // With 100 calls, we should have many unique values (at least 90%)
    expect(otps.size).toBeGreaterThan(90)
  })
})

describe('maskEmail', () => {
  it('should mask email correctly with long local part', () => {
    expect(maskEmail('usuario@email.com')).toBe('usu***@email.com')
    expect(maskEmail('johndoe@gmail.com')).toBe('joh***@gmail.com')
  })

  it('should mask email correctly with short local part', () => {
    expect(maskEmail('ab@email.com')).toBe('ab***@email.com')
    expect(maskEmail('a@email.com')).toBe('a***@email.com')
  })

  it('should mask email with exactly 3 chars in local part', () => {
    expect(maskEmail('abc@email.com')).toBe('abc***@email.com')
  })

  it('should preserve domain', () => {
    expect(maskEmail('test@subdomain.domain.com')).toBe('tes***@subdomain.domain.com')
  })

  it('should return original for invalid email without @', () => {
    expect(maskEmail('notanemail')).toBe('notanemail')
  })

  it('should handle empty string', () => {
    expect(maskEmail('')).toBe('')
  })

  it('should handle email with empty local part', () => {
    expect(maskEmail('@domain.com')).toBe('@domain.com')
  })

  it('should handle various email formats', () => {
    expect(maskEmail('user.name@email.com')).toBe('use***@email.com')
    expect(maskEmail('user+tag@email.com')).toBe('use***@email.com')
    expect(maskEmail('user_name@email.com')).toBe('use***@email.com')
  })
})
