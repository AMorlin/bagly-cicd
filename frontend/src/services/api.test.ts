import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('api service', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('should create axios instance with correct config', async () => {
    const mockInterceptors = {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    }
    const mockInstance = {
      interceptors: mockInterceptors,
      get: vi.fn(),
      post: vi.fn(),
    }

    vi.doMock('axios', () => ({
      default: { create: vi.fn(() => mockInstance) },
    }))

    vi.doMock('@/stores/auth', () => ({
      useAuthStore: { getState: vi.fn(() => ({ token: null, logout: vi.fn() })) },
    }))

    const axios = (await import('axios')).default
    await import('./api')

    expect(axios.create).toHaveBeenCalledWith({
      baseURL: '/api',
      headers: { 'Content-Type': 'application/json' },
    })
  })

  it('should register request and response interceptors', async () => {
    const mockInterceptors = {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    }
    const mockInstance = {
      interceptors: mockInterceptors,
      get: vi.fn(),
      post: vi.fn(),
    }

    vi.doMock('axios', () => ({
      default: { create: vi.fn(() => mockInstance) },
    }))

    vi.doMock('@/stores/auth', () => ({
      useAuthStore: { getState: vi.fn(() => ({ token: null, logout: vi.fn() })) },
    }))

    await import('./api')

    expect(mockInterceptors.request.use).toHaveBeenCalledTimes(1)
    expect(mockInterceptors.response.use).toHaveBeenCalledTimes(1)
  })

  it('should add Authorization header when token exists', async () => {
    const mockInterceptors = {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    }
    const mockInstance = {
      interceptors: mockInterceptors,
      get: vi.fn(),
      post: vi.fn(),
    }

    vi.doMock('axios', () => ({
      default: { create: vi.fn(() => mockInstance) },
    }))

    vi.doMock('@/stores/auth', () => ({
      useAuthStore: { getState: vi.fn(() => ({ token: 'test-token', logout: vi.fn() })) },
    }))

    await import('./api')

    const requestInterceptor = mockInterceptors.request.use.mock.calls[0][0]
    const config = { headers: {} as Record<string, string> }
    const result = requestInterceptor(config)

    expect(result.headers.Authorization).toBe('Bearer test-token')
  })

  it('should not add Authorization header when no token', async () => {
    const mockInterceptors = {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    }
    const mockInstance = {
      interceptors: mockInterceptors,
      get: vi.fn(),
      post: vi.fn(),
    }

    vi.doMock('axios', () => ({
      default: { create: vi.fn(() => mockInstance) },
    }))

    vi.doMock('@/stores/auth', () => ({
      useAuthStore: { getState: vi.fn(() => ({ token: null, logout: vi.fn() })) },
    }))

    await import('./api')

    const requestInterceptor = mockInterceptors.request.use.mock.calls[0][0]
    const config = { headers: {} as Record<string, string> }
    const result = requestInterceptor(config)

    expect(result.headers.Authorization).toBeUndefined()
  })

  it('should call logout and redirect on 401 response error', async () => {
    const mockLogout = vi.fn()
    const mockInterceptors = {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    }
    const mockInstance = {
      interceptors: mockInterceptors,
      get: vi.fn(),
      post: vi.fn(),
    }

    vi.doMock('axios', () => ({
      default: { create: vi.fn(() => mockInstance) },
    }))

    vi.doMock('@/stores/auth', () => ({
      useAuthStore: { getState: vi.fn(() => ({ token: 'tk', logout: mockLogout })) },
    }))

    Object.defineProperty(globalThis, 'location', {
      value: { href: '' },
      writable: true,
      configurable: true,
    })

    await import('./api')

    const errorHandler = mockInterceptors.response.use.mock.calls[0][1]
    const error = { response: { status: 401 } }

    await expect(errorHandler(error)).rejects.toEqual(error)
    expect(mockLogout).toHaveBeenCalled()
    expect(globalThis.location.href).toBe('/auth/cpf')
  })

  it('should pass through success responses', async () => {
    const mockInterceptors = {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    }
    const mockInstance = {
      interceptors: mockInterceptors,
      get: vi.fn(),
      post: vi.fn(),
    }

    vi.doMock('axios', () => ({
      default: { create: vi.fn(() => mockInstance) },
    }))

    vi.doMock('@/stores/auth', () => ({
      useAuthStore: { getState: vi.fn(() => ({ token: null, logout: vi.fn() })) },
    }))

    await import('./api')

    const successHandler = mockInterceptors.response.use.mock.calls[0][0]
    const response = { data: 'ok', status: 200 }
    expect(successHandler(response)).toEqual(response)
  })

  it('should reject non-401 errors without logout', async () => {
    const mockLogout = vi.fn()
    const mockInterceptors = {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    }
    const mockInstance = {
      interceptors: mockInterceptors,
      get: vi.fn(),
      post: vi.fn(),
    }

    vi.doMock('axios', () => ({
      default: { create: vi.fn(() => mockInstance) },
    }))

    vi.doMock('@/stores/auth', () => ({
      useAuthStore: { getState: vi.fn(() => ({ token: 'tk', logout: mockLogout })) },
    }))

    await import('./api')

    const errorHandler = mockInterceptors.response.use.mock.calls[0][1]
    const error = { response: { status: 500 } }

    await expect(errorHandler(error)).rejects.toEqual(error)
    expect(mockLogout).not.toHaveBeenCalled()
  })
})
