import { describe, it, expect, vi } from 'vitest'
import { authenticate } from './auth.js'

function createMockReply() {
  const reply: any = {
    status: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  }
  return reply
}

describe('authenticate middleware', () => {
  it('should call jwtVerify on request', async () => {
    const request: any = {
      jwtVerify: vi.fn().mockResolvedValue(undefined),
    }
    const reply = createMockReply()

    await authenticate(request, reply)

    expect(request.jwtVerify).toHaveBeenCalled()
    expect(reply.status).not.toHaveBeenCalled()
  })

  it('should return 401 when jwtVerify throws', async () => {
    const request: any = {
      jwtVerify: vi.fn().mockRejectedValue(new Error('Invalid token')),
    }
    const reply = createMockReply()

    await authenticate(request, reply)

    expect(reply.status).toHaveBeenCalledWith(401)
    expect(reply.send).toHaveBeenCalledWith({ error: 'Unauthorized' })
  })

  it('should not send error when token is valid', async () => {
    const request: any = {
      jwtVerify: vi.fn().mockResolvedValue({ userId: '123' }),
    }
    const reply = createMockReply()

    await authenticate(request, reply)

    expect(reply.send).not.toHaveBeenCalled()
  })
})
