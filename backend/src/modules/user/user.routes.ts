import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../lib/prisma.js'
import { authenticate } from '../../shared/middlewares/auth.js'

const updateUserSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  phone: z.string().min(10).max(11).optional(),
  email: z.string().email().max(255).optional(),
})

export async function userRoutes(app: FastifyInstance) {
  app.addHook('onRequest', authenticate)

  app.get('/me', async (request, reply) => {
    const { userId } = request.user

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return reply.status(404).send({ error: 'User not found' })
    }

    return reply.status(200).send({
      id: user.id,
      cpf: user.cpf,
      email: user.email,
      name: user.name,
      phone: user.phone,
      createdAt: user.createdAt,
    })
  })

  app.put('/me', async (request, reply) => {
    const { userId } = request.user
    const data = updateUserSchema.parse(request.body)

    const user = await prisma.user.update({
      where: { id: userId },
      data,
    })

    return reply.status(200).send({
      id: user.id,
      cpf: user.cpf,
      email: user.email,
      name: user.name,
      phone: user.phone,
      createdAt: user.createdAt,
    })
  })
}
