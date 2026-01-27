import { api } from './api'

interface RequestOtpResponse {
  message: string
  email?: string
  requiresEmail?: boolean
}

interface VerifyOtpResponse {
  token: string
  user: {
    id: string
    cpf: string
    email: string
    name?: string
    phone?: string
  }
}

export async function requestOtp(cpf: string, email?: string): Promise<RequestOtpResponse> {
  const { data } = await api.post<RequestOtpResponse>('/auth/request-otp', { cpf, email })
  return data
}

export async function verifyOtp(cpf: string, code: string): Promise<VerifyOtpResponse> {
  const { data } = await api.post<VerifyOtpResponse>('/auth/verify-otp', { cpf, code })
  return data
}

export async function resendOtp(cpf: string): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>('/auth/resend-otp', { cpf })
  return data
}
