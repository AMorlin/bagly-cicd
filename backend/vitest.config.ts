import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/**/*.ts'],
      exclude: [
        'node_modules/',
        'prisma/',
        'src/**/*.test.ts',
        'src/**/*.spec.ts',
        'src/**/index.ts',
        'src/server.ts',
        'src/config/**',
        'src/lib/**',
        'src/**/*.routes.ts',
        'src/**/*.service.ts',
        'src/shared/middlewares/**',
        'src/shared/errors/error-handler.ts',
      ],
    },
  },
})
