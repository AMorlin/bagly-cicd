import { describe, it, expect, vi } from 'vitest'
import { ZodError, z } from 'zod'
import { errorHandler } from './error-handler.js'
import { AppError } from './app-error.js'

function createMockReply() {
  const reply: any = {
    status: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  }
  return reply
}

function createMockRequest() {
  return {} as any
}

describe('errorHandler', () => {
  it('should handle AppError with correct status and message', () => {
    const reply = createMockReply()
    const error = new AppError('Not found', 404) as any

    errorHandler(error, createMockRequest(), reply)

    expect(reply.status).toHaveBeenCalledWith(404)
    expect(reply.send).toHaveBeenCalledWith({ error: 'Not found' })
  })

  it('should handle AppError with default status code 400', () => {
    const reply = createMockReply()
    const error = new AppError('Bad request') as any

    errorHandler(error, createMockRequest(), reply)

    expect(reply.status).toHaveBeenCalledWith(400)
    expect(reply.send).toHaveBeenCalledWith({ error: 'Bad request' })
  })

  it('should handle ZodError with 400 status and validation details', () => {
    const reply = createMockReply()

    let zodError: ZodError
    try {
      z.object({ name: z.string() }).parse({ name: 123 })
      throw new Error('Should not reach')
    } catch (e) {
      zodError = e as ZodError
    }

    errorHandler(zodError! as any, createMockRequest(), reply)

    expect(reply.status).toHaveBeenCalledWith(400)
    expect(reply.send).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Validation error',
        details: expect.any(Object),
      })
    )
  })

  it('should handle unknown errors with 500 status', () => {
    const reply = createMockReply()
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const error = new Error('Something unexpected') as any

    errorHandler(error, createMockRequest(), reply)

    expect(reply.status).toHaveBeenCalledWith(500)
    expect(reply.send).toHaveBeenCalledWith({ error: 'Internal server error' })
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('should log unhandled errors to console', () => {
    const reply = createMockReply()
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const error = new Error('Crash') as any

    errorHandler(error, createMockRequest(), reply)

    expect(consoleSpy).toHaveBeenCalledWith('Unhandled error:', error)
    consoleSpy.mockRestore()
  })
})
