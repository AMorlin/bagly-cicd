import { describe, it, expect } from 'vitest'
import { AppError } from './app-error.js'

describe('AppError', () => {
  it('should create error with message and default status code', () => {
    const error = new AppError('Something went wrong')

    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(AppError)
    expect(error.message).toBe('Something went wrong')
    expect(error.statusCode).toBe(400)
    expect(error.name).toBe('AppError')
  })

  it('should create error with custom status code', () => {
    const error = new AppError('Not found', 404)

    expect(error.message).toBe('Not found')
    expect(error.statusCode).toBe(404)
  })

  it('should create error with 401 unauthorized', () => {
    const error = new AppError('Unauthorized', 401)

    expect(error.message).toBe('Unauthorized')
    expect(error.statusCode).toBe(401)
  })

  it('should create error with 403 forbidden', () => {
    const error = new AppError('Forbidden', 403)

    expect(error.message).toBe('Forbidden')
    expect(error.statusCode).toBe(403)
  })

  it('should create error with 500 internal server error', () => {
    const error = new AppError('Internal error', 500)

    expect(error.message).toBe('Internal error')
    expect(error.statusCode).toBe(500)
  })

  it('should be throwable and catchable', () => {
    expect(() => {
      throw new AppError('Test error', 422)
    }).toThrow(AppError)
  })

  it('should have correct error properties', () => {
    const error = new AppError('Validation failed', 422)

    expect(error).toHaveProperty('message')
    expect(error).toHaveProperty('statusCode')
    expect(error).toHaveProperty('name')
    expect(error).toHaveProperty('stack')
  })

  it('should work with try-catch', () => {
    try {
      throw new AppError('Caught error', 400)
    } catch (e) {
      expect(e).toBeInstanceOf(AppError)
      if (e instanceof AppError) {
        expect(e.statusCode).toBe(400)
      }
    }
  })
})
