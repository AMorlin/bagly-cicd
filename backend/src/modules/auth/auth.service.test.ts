import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('sendOTPEmail', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.unstubAllEnvs()
  })

  it('should log OTP in dev mode when no email provider is configured', async () => {
    vi.stubEnv('RESEND_API_KEY', '')
    vi.stubEnv('SMTP_HOST', '')
    vi.stubEnv('SMTP_USER', '')
    vi.stubEnv('SMTP_PASS', '')

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    const { sendOTPEmail } = await import('./auth.service.js')
    await sendOTPEmail('user@test.com', '123456')

    expect(consoleSpy).toHaveBeenCalledWith('=== OTP EMAIL (DEV MODE) ===')
    expect(consoleSpy).toHaveBeenCalledWith('To: user@test.com')
    expect(consoleSpy).toHaveBeenCalledWith('OTP: 123456')
    expect(consoleSpy).toHaveBeenCalledWith('============================')
    consoleSpy.mockRestore()
  })

  it('should use default EMAIL_FROM when not set', async () => {
    vi.stubEnv('RESEND_API_KEY', '')
    vi.stubEnv('SMTP_HOST', '')
    vi.stubEnv('SMTP_USER', '')
    vi.stubEnv('SMTP_PASS', '')
    vi.stubEnv('EMAIL_FROM', '')

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    const { sendOTPEmail } = await import('./auth.service.js')
    await sendOTPEmail('test@example.com', '654321')

    expect(consoleSpy).toHaveBeenCalledWith('To: test@example.com')
    expect(consoleSpy).toHaveBeenCalledWith('OTP: 654321')
    consoleSpy.mockRestore()
  })

  it('should not throw in dev mode', async () => {
    vi.stubEnv('RESEND_API_KEY', '')
    vi.stubEnv('SMTP_HOST', '')
    vi.stubEnv('SMTP_USER', '')
    vi.stubEnv('SMTP_PASS', '')

    vi.spyOn(console, 'log').mockImplementation(() => {})

    const { sendOTPEmail } = await import('./auth.service.js')
    await expect(sendOTPEmail('a@b.com', '111111')).resolves.toBeUndefined()
  })
})
