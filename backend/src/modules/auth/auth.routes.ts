import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../lib/prisma.js'
import { redis } from '../../config/redis.js'
import { AppError } from '../../shared/errors/app-error.js'
import { validateCPF, generateOTP, maskEmail } from '../../shared/utils/validators.js'
import { sendOTPEmail } from './auth.service.js'

const requestOtpSchema = z.object({
  cpf: z
    .string()
    .transform((val) => val.replaceAll(/\D/g, ''))
    .refine((val) => val.length === 11, 'CPF deve conter 11 dígitos')
    .refine(validateCPF, 'CPF inválido'),
  email: z.string().email('E-mail inválido').optional(),
})

const verifyOtpSchema = z.object({
  cpf: z
    .string()
    .transform((val) => val.replaceAll(/\D/g, ''))
    .refine((val) => val.length === 11, 'CPF deve conter 11 dígitos'),
  code: z.string().length(6, 'Código deve ter 6 dígitos'),
})

export async function authRoutes(app: FastifyInstance) {
  // Solicita OTP - cria usuário automaticamente se não existir
  app.post('/request-otp', async (request, reply) => {
    const { cpf, email } = requestOtpSchema.parse(request.body)

    const rateLimitKey = `otp:ratelimit:${cpf}`
    const rateLimitCount = await redis.get(rateLimitKey)

    if (rateLimitCount && Number.parseInt(rateLimitCount, 10) >= 3) {
      throw new AppError('Muitas tentativas. Aguarde 15 minutos.', 429)
    }

    let user = await prisma.user.findUnique({
      where: { cpf },
    })

    // Se usuário não existe
    if (!user) {
      // Email é obrigatório para novos usuários
      if (!email) {
        return reply.status(200).send({
          message: 'CPF não cadastrado',
          requiresEmail: true,
        })
      }

      // Criar novo usuário
      user = await prisma.user.create({
        data: {
          cpf,
          email,
        },
      })
    }

    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    await prisma.otpCode.create({
      data: {
        code: otp,
        userId: user.id,
        expiresAt,
      },
    })

    await sendOTPEmail(user.email, otp)

    await redis.incr(rateLimitKey)
    await redis.expire(rateLimitKey, 15 * 60)

    return reply.status(200).send({
      message: 'Código enviado com sucesso',
      email: maskEmail(user.email),
    })
  })

  app.post('/verify-otp', async (request, reply) => {
    const { cpf, code } = verifyOtpSchema.parse(request.body)

    const blockKey = `otp:block:${cpf}`
    const isBlocked = await redis.get(blockKey)

    if (isBlocked) {
      throw new AppError('Conta bloqueada temporariamente. Tente novamente em 30 minutos.', 429)
    }

    const user = await prisma.user.findUnique({
      where: { cpf },
    })

    if (!user) {
      throw new AppError('CPF não encontrado.', 404)
    }

    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        userId: user.id,
        code,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (!otpRecord) {
      const attemptKey = `otp:attempts:${cpf}`
      const attempts = await redis.incr(attemptKey)
      await redis.expire(attemptKey, 30 * 60)

      if (attempts >= 5) {
        await redis.set(blockKey, '1', 'EX', 30 * 60)
        throw new AppError('Muitas tentativas incorretas. Conta bloqueada por 30 minutos.', 429)
      }

      throw new AppError(`Código inválido ou expirado. ${5 - attempts} tentativas restantes.`, 400)
    }

    await prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { used: true },
    })

    await redis.del(`otp:attempts:${cpf}`)

    const token = app.jwt.sign(
      { userId: user.id },
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    return reply.status(200).send({
      token,
      user: {
        id: user.id,
        cpf: user.cpf,
        email: user.email,
        name: user.name,
        phone: user.phone,
      },
    })
  })

  app.post('/resend-otp', async (request, reply) => {
    const { cpf } = requestOtpSchema.parse(request.body)

    const rateLimitKey = `otp:resend:${cpf}`
    const rateLimitCount = await redis.get(rateLimitKey)

    if (rateLimitCount && Number.parseInt(rateLimitCount, 10) >= 3) {
      throw new AppError('Muitos reenvios. Aguarde 15 minutos.', 429)
    }

    const user = await prisma.user.findUnique({
      where: { cpf },
    })

    if (!user) {
      throw new AppError('CPF não encontrado.', 404)
    }

    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    await prisma.otpCode.create({
      data: {
        code: otp,
        userId: user.id,
        expiresAt,
      },
    })

    await sendOTPEmail(user.email, otp)

    await redis.incr(rateLimitKey)
    await redis.expire(rateLimitKey, 15 * 60)

    return reply.status(200).send({
      message: 'Código reenviado com sucesso',
    })
  })
}
