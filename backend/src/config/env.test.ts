import { describe, it, expect } from 'vitest'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.string(),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  OTP_EXPIRATION_MINUTES: z.coerce.number().default(10),
  OTP_MAX_ATTEMPTS: z.coerce.number().default(5),
  OTP_BLOCK_DURATION_MINUTES: z.coerce.number().default(30),
  RESEND_API_KEY: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().default('noreply@bagly.com.br'),
  UPLOAD_PROVIDER: z.enum(['local', 's3']).default('local'),
  UPLOAD_LOCAL_PATH: z.string().default('./uploads'),
  UPLOAD_MAX_SIZE_MB: z.coerce.number().default(5),
  UPLOAD_MAX_FILES: z.coerce.number().default(5),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_BUCKET_NAME: z.string().optional(),
  AWS_REGION: z.string().optional(),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
})

describe('env schema validation', () => {
  const validEnv = {
    DATABASE_URL: 'postgresql://user:pass@localhost:5432/bagly',
    JWT_SECRET: 'a-very-secure-secret-key-with-32-chars!',
  }

  it('should parse valid environment with defaults', () => {
    const result = envSchema.parse(validEnv)

    expect(result.NODE_ENV).toBe('development')
    expect(result.PORT).toBe(3333)
    expect(result.DATABASE_URL).toBe(validEnv.DATABASE_URL)
    expect(result.REDIS_URL).toBe('redis://localhost:6379')
    expect(result.JWT_SECRET).toBe(validEnv.JWT_SECRET)
    expect(result.JWT_EXPIRES_IN).toBe('7d')
    expect(result.OTP_EXPIRATION_MINUTES).toBe(10)
    expect(result.OTP_MAX_ATTEMPTS).toBe(5)
    expect(result.OTP_BLOCK_DURATION_MINUTES).toBe(30)
    expect(result.EMAIL_FROM).toBe('noreply@bagly.com.br')
    expect(result.UPLOAD_PROVIDER).toBe('local')
    expect(result.UPLOAD_LOCAL_PATH).toBe('./uploads')
    expect(result.UPLOAD_MAX_SIZE_MB).toBe(5)
    expect(result.UPLOAD_MAX_FILES).toBe(5)
    expect(result.FRONTEND_URL).toBe('http://localhost:5173')
  })

  it('should fail when DATABASE_URL is missing', () => {
    expect(() => envSchema.parse({ JWT_SECRET: validEnv.JWT_SECRET })).toThrow()
  })

  it('should fail when JWT_SECRET is missing', () => {
    expect(() => envSchema.parse({ DATABASE_URL: validEnv.DATABASE_URL })).toThrow()
  })

  it('should fail when JWT_SECRET is too short', () => {
    expect(() =>
      envSchema.parse({ DATABASE_URL: validEnv.DATABASE_URL, JWT_SECRET: 'short' })
    ).toThrow()
  })

  it('should accept valid NODE_ENV values', () => {
    const envs = ['development', 'production', 'test']
    envs.forEach((env) => {
      const result = envSchema.parse({ ...validEnv, NODE_ENV: env })
      expect(result.NODE_ENV).toBe(env)
    })
  })

  it('should reject invalid NODE_ENV', () => {
    expect(() => envSchema.parse({ ...validEnv, NODE_ENV: 'staging' })).toThrow()
  })

  it('should coerce PORT to number', () => {
    const result = envSchema.parse({ ...validEnv, PORT: '8080' })
    expect(result.PORT).toBe(8080)
  })

  it('should accept optional SMTP fields', () => {
    const result = envSchema.parse({
      ...validEnv,
      SMTP_HOST: 'smtp.gmail.com',
      SMTP_PORT: '587',
      SMTP_USER: 'user@gmail.com',
      SMTP_PASS: 'password',
    })
    expect(result.SMTP_HOST).toBe('smtp.gmail.com')
    expect(result.SMTP_PORT).toBe(587)
    expect(result.SMTP_USER).toBe('user@gmail.com')
    expect(result.SMTP_PASS).toBe('password')
  })

  it('should accept UPLOAD_PROVIDER as local or s3', () => {
    const local = envSchema.parse({ ...validEnv, UPLOAD_PROVIDER: 'local' })
    expect(local.UPLOAD_PROVIDER).toBe('local')

    const s3 = envSchema.parse({ ...validEnv, UPLOAD_PROVIDER: 's3' })
    expect(s3.UPLOAD_PROVIDER).toBe('s3')
  })

  it('should reject invalid UPLOAD_PROVIDER', () => {
    expect(() => envSchema.parse({ ...validEnv, UPLOAD_PROVIDER: 'gcs' })).toThrow()
  })
})
