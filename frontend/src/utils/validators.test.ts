import { describe, it, expect } from 'vitest'
import { validateCPF, formatCPF, formatPhone, maskEmail } from './validators'

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
  })

  it('should handle CPF with different separators', () => {
    expect(validateCPF('529-982-247/25')).toBe(true)
    expect(validateCPF('529 982 247 25')).toBe(true)
  })
})

describe('formatCPF', () => {
  it('should format CPF correctly', () => {
    expect(formatCPF('52998224725')).toBe('529.982.247-25')
  })

  it('should not format CPF with partial input (returns as-is)', () => {
    expect(formatCPF('529')).toBe('529')
    expect(formatCPF('529982')).toBe('529982')
    expect(formatCPF('529982247')).toBe('529982247')
  })

  it('should format CPF removing non-numeric chars', () => {
    expect(formatCPF('529.982.247-25')).toBe('529.982.247-25')
  })

  it('should handle empty string', () => {
    expect(formatCPF('')).toBe('')
  })

  it('should format CPF with letters (removes them)', () => {
    expect(formatCPF('529abc98224725')).toBe('529.982.247-25')
  })

  it('should format various valid CPFs', () => {
    expect(formatCPF('11144477735')).toBe('111.444.777-35')
    expect(formatCPF('12345678909')).toBe('123.456.789-09')
  })
})

describe('formatPhone', () => {
  it('should format phone with 11 digits (mobile)', () => {
    expect(formatPhone('11999998888')).toBe('(11) 99999-8888')
  })

  it('should format phone with 10 digits (landline)', () => {
    expect(formatPhone('1199998888')).toBe('(11) 9999-8888')
  })

  it('should format phone with various DDDs', () => {
    expect(formatPhone('21999887766')).toBe('(21) 99988-7766')
    expect(formatPhone('31988776655')).toBe('(31) 98877-6655')
  })

  it('should handle phone with formatting', () => {
    expect(formatPhone('(11) 99999-8888')).toBe('(11) 99999-8888')
  })

  it('should handle empty string', () => {
    expect(formatPhone('')).toBe('')
  })

  it('should remove non-numeric characters before formatting', () => {
    expect(formatPhone('11-99999-8888')).toBe('(11) 99999-8888')
  })

  it('should not format partial phone numbers (returns as-is or partial match)', () => {
    // Function only formats 10 or 11 digit numbers
    expect(formatPhone('11')).toBe('11')
    expect(formatPhone('119999')).toBe('119999')
  })

  it('should handle phone numbers with extra digits', () => {
    // When more than 11 digits, regex applies to first match
    const result = formatPhone('+55 11 99999 8888')
    expect(result.length).toBeGreaterThan(0)
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

  it('should handle corporate emails', () => {
    expect(maskEmail('funcionario@empresa.com.br')).toBe('fun***@empresa.com.br')
  })
})
