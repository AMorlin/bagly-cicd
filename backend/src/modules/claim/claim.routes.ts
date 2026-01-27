import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../lib/prisma.js'
import { authenticate } from '../../shared/middlewares/auth.js'
import { validateCPF } from '../../shared/utils/validators.js'
import { getAirportByCode } from './claim.data.js'

const createClaimSchema = z.object({
  fullName: z.string().min(3).max(100),
  cpf: z
    .string()
    .transform((val) => val.replaceAll(/\D/g, ''))
    .refine((val) => val.length === 11)
    .refine(validateCPF),
  phone: z
    .string()
    .transform((val) => val.replaceAll(/\D/g, ''))
    .refine((val) => val.length >= 10 && val.length <= 11),
  email: z.string().email().max(255),
  airline: z.enum(['GOL', 'LATAM', 'AZUL', 'AVIANCA', 'OTHER']),
  airportCode: z.string().length(3).toUpperCase(),
  flightDate: z.coerce.date(),
  locator: z.string().min(5).max(10).toUpperCase(),
  baggageSize: z.enum(['SMALL', 'MEDIUM', 'LARGE']),
  milesClub: z.string().optional(),
  milesNumber: z.string().optional(),
  damageDescription: z.string().min(20).max(2000),
  baggageContents: z.string().min(10).max(1000),
  images: z.array(z.string().startsWith('/uploads/')).min(1).max(5),
})

export async function claimRoutes(app: FastifyInstance) {
  app.addHook('onRequest', authenticate)

  app.get('/', async (request, reply) => {
    const { userId } = request.user

    const claims = await prisma.claim.findMany({
      where: { userId },
      include: {
        images: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return reply.status(200).send(claims)
  })

  app.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const { userId } = request.user

    const claim = await prisma.claim.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        images: true,
      },
    })

    if (!claim) {
      return reply.status(404).send({ error: 'Claim not found' })
    }

    return reply.status(200).send(claim)
  })

  app.post('/', async (request, reply) => {
    const { userId } = request.user
    const data = createClaimSchema.parse(request.body)

    const airport = getAirportByCode(data.airportCode)
    const airportName = airport?.name || data.airportCode

    const claim = await prisma.claim.create({
      data: {
        userId,
        fullName: data.fullName,
        cpf: data.cpf,
        phone: data.phone,
        email: data.email,
        airline: data.airline,
        airportCode: data.airportCode,
        airportName,
        flightDate: data.flightDate,
        locator: data.locator,
        baggageSize: data.baggageSize,
        milesClub: data.milesClub,
        milesNumber: data.milesNumber,
        damageDescription: data.damageDescription,
        baggageContents: data.baggageContents,
        images: {
          create: data.images.map((url) => ({
            url,
            filename: url.split('/').pop() || 'image',
            size: 0,
            mimeType: 'image/jpeg',
          })),
        },
      },
      include: {
        images: true,
      },
    })

    return reply.status(201).send(claim)
  })

  app.put('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const { userId } = request.user
    const data = request.body as Record<string, unknown>

    const existingClaim = await prisma.claim.findFirst({
      where: {
        id,
        userId,
      },
    })

    if (!existingClaim) {
      return reply.status(404).send({ error: 'Claim not found' })
    }

    const claim = await prisma.claim.update({
      where: { id },
      data,
      include: {
        images: true,
      },
    })

    return reply.status(200).send(claim)
  })
}
