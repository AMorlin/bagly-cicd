import { FastifyInstance } from 'fastify'
import { createWriteStream, existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { pipeline } from 'node:stream/promises'
import { randomUUID } from 'node:crypto'
import { authenticate } from '../../shared/middlewares/auth.js'
import { AppError } from '../../shared/errors/app-error.js'

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_FILE_SIZE = 5 * 1024 * 1024
const UPLOAD_DIR = process.env.UPLOAD_LOCAL_PATH || './uploads'

interface FileValidationResult {
  isValid: boolean
  error?: string
}

function validateFileType(mimetype: string): FileValidationResult {
  if (!ALLOWED_TYPES.has(mimetype)) {
    return {
      isValid: false,
      error: 'Tipo de arquivo não permitido. Use JPEG, PNG ou WebP.',
    }
  }
  return { isValid: true }
}

function validateFileCount(count: number, max: number): FileValidationResult {
  if (count >= max) {
    return {
      isValid: false,
      error: `Máximo de ${max} arquivos permitidos.`,
    }
  }
  return { isValid: true }
}

async function readFileChunks(
  fileStream: AsyncIterable<Buffer>
): Promise<{ chunks: Buffer[]; size: number }> {
  const chunks: Buffer[] = []
  let size = 0

  for await (const chunk of fileStream) {
    size += chunk.length
    if (size > MAX_FILE_SIZE) {
      throw new AppError('Arquivo muito grande. Máximo 5MB.', 400)
    }
    chunks.push(chunk)
  }

  return { chunks, size }
}

async function saveFile(chunks: Buffer[], filepath: string): Promise<void> {
  const writeStream = createWriteStream(filepath)
  await pipeline(
    (async function* () {
      for (const chunk of chunks) {
        yield chunk
      }
    })(),
    writeStream
  )
}

function ensureUploadDir(): void {
  if (!existsSync(UPLOAD_DIR)) {
    mkdirSync(UPLOAD_DIR, { recursive: true })
  }
}

export async function uploadRoutes(app: FastifyInstance) {
  app.addHook('onRequest', authenticate)

  app.post('/', async (request, reply) => {
    const parts = request.parts()
    const urls: string[] = []

    ensureUploadDir()

    let fileCount = 0
    const maxFiles = Number.parseInt(process.env.UPLOAD_MAX_FILES || '5', 10)

    for await (const part of parts) {
      if (part.type !== 'file') {
        continue
      }

      const countValidation = validateFileCount(fileCount, maxFiles)
      if (!countValidation.isValid) {
        throw new AppError(countValidation.error!, 400)
      }

      const typeValidation = validateFileType(part.mimetype)
      if (!typeValidation.isValid) {
        throw new AppError(typeValidation.error!, 400)
      }

      const ext = part.filename.split('.').pop() || 'jpg'
      const filename = `${randomUUID()}.${ext}`
      const filepath = join(UPLOAD_DIR, filename)

      const { chunks } = await readFileChunks(part.file)
      await saveFile(chunks, filepath)

      urls.push(`/uploads/${filename}`)
      fileCount++
    }

    if (urls.length === 0) {
      throw new AppError('Nenhum arquivo enviado.', 400)
    }

    return reply.status(200).send({ urls })
  })
}
