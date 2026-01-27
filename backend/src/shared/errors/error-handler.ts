import { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { ZodError } from 'zod'
import { AppError } from './app-error.js'

export function errorHandler(
  error: FastifyError,
  _request: FastifyRequest,
  reply: FastifyReply
) {
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      error: error.message,
    })
  }

  if (error instanceof ZodError) {
    return reply.status(400).send({
      error: 'Validation error',
      details: error.flatten().fieldErrors,
    })
  }

  console.error('Unhandled error:', error)

  return reply.status(500).send({
    error: 'Internal server error',
  })
}
