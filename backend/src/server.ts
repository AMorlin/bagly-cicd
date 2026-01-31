import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import rateLimit from '@fastify/rate-limit'
import multipart from '@fastify/multipart'
import fastifyStatic from '@fastify/static'
import { resolve } from 'node:path'
import { authRoutes } from './modules/auth/auth.routes.js'
import { userRoutes } from './modules/user/user.routes.js'
import { claimRoutes } from './modules/claim/claim.routes.js'
import { uploadRoutes } from './modules/upload/upload.routes.js'
import { errorHandler } from './shared/errors/error-handler.js'

const app = Fastify({
  logger: true,
})

app.register(cors, {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
})

app.register(jwt, {
  secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
})

app.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
})

app.register(multipart, {
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 5,
  },
})

app.register(fastifyStatic, {
  root: resolve(process.cwd(), process.env.UPLOAD_LOCAL_PATH || 'uploads'),
  prefix: '/uploads/',
  decorateReply: false,
})

app.setErrorHandler(errorHandler)

app.register(authRoutes, { prefix: '/api/auth' })
app.register(userRoutes, { prefix: '/api/users' })
app.register(claimRoutes, { prefix: '/api/claims' })
app.register(uploadRoutes, { prefix: '/api/upload' })

app.get('/api/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

const start = async () => {
  try {
    const port = Number.parseInt(process.env.PORT || '3333', 10)
    await app.listen({ port, host: '0.0.0.0' })
    console.log(`Server running on http://localhost:${port}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
