import { randomInt } from 'node:crypto'

export function validateCPF(cpf: string): boolean {
  const cleanCPF = cpf.replaceAll(/\D/g, '')

  if (cleanCPF.length !== 11) return false
  if (/^(\d)\1+$/.test(cleanCPF)) return false

  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += Number.parseInt(cleanCPF.charAt(i), 10) * (10 - i)
  }
  let remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== Number.parseInt(cleanCPF.charAt(9), 10)) return false

  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += Number.parseInt(cleanCPF.charAt(i), 10) * (11 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== Number.parseInt(cleanCPF.charAt(10), 10)) return false

  return true
}

export function generateOTP(): string {
  return randomInt(100000, 1000000).toString()
}

export function maskEmail(email: string): string {
  const [localPart, domain] = email.split('@')
  if (!localPart || !domain) return email

  const visibleChars = Math.min(3, localPart.length)
  const masked = localPart.slice(0, visibleChars) + '***'
  return `${masked}@${domain}`
}
