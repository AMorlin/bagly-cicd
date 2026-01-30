import { describe, it, expect, vi, beforeEach } from 'vitest'
import { requestOtp, verifyOtp, resendOtp } from './auth'

vi.mock('./api', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

import { api } from './api'

describe('auth service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('requestOtp', () => {
    it('should call POST /auth/request-otp with cpf', async () => {
      const mockResponse = { data: { message: 'OTP sent', email: 'a@b.com' } }
      vi.mocked(api.post).mockResolvedValue(mockResponse)

      const result = await requestOtp('12345678901')

      expect(api.post).toHaveBeenCalledWith('/auth/request-otp', { cpf: '12345678901', email: undefined })
      expect(result).toEqual(mockResponse.data)
    })

    it('should send email when provided', async () => {
      const mockResponse = { data: { message: 'OTP sent' } }
      vi.mocked(api.post).mockResolvedValue(mockResponse)

      await requestOtp('12345678901', 'test@test.com')

      expect(api.post).toHaveBeenCalledWith('/auth/request-otp', {
        cpf: '12345678901',
        email: 'test@test.com',
      })
    })
  })

  describe('verifyOtp', () => {
    it('should call POST /auth/verify-otp with cpf and code', async () => {
      const mockResponse = {
        data: {
          token: 'jwt-token',
          user: { id: '1', cpf: '12345678901', email: 'a@b.com' },
        },
      }
      vi.mocked(api.post).mockResolvedValue(mockResponse)

      const result = await verifyOtp('12345678901', '123456')

      expect(api.post).toHaveBeenCalledWith('/auth/verify-otp', { cpf: '12345678901', code: '123456' })
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('resendOtp', () => {
    it('should call POST /auth/resend-otp with cpf', async () => {
      const mockResponse = { data: { message: 'OTP resent' } }
      vi.mocked(api.post).mockResolvedValue(mockResponse)

      const result = await resendOtp('12345678901')

      expect(api.post).toHaveBeenCalledWith('/auth/resend-otp', { cpf: '12345678901' })
      expect(result).toEqual(mockResponse.data)
    })
  })
})
