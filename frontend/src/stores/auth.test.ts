import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from './auth'

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      token: null,
      user: null,
      cpf: null,
      email: null,
    })
  })

  it('should have initial state with null values', () => {
    const state = useAuthStore.getState()
    expect(state.token).toBeNull()
    expect(state.user).toBeNull()
    expect(state.cpf).toBeNull()
    expect(state.email).toBeNull()
  })

  it('should set token', () => {
    useAuthStore.getState().setToken('abc123')
    expect(useAuthStore.getState().token).toBe('abc123')
  })

  it('should set user', () => {
    const user = { id: '1', cpf: '12345678901', email: 'test@test.com' }
    useAuthStore.getState().setUser(user)
    expect(useAuthStore.getState().user).toEqual(user)
  })

  it('should set cpf', () => {
    useAuthStore.getState().setCpf('12345678901')
    expect(useAuthStore.getState().cpf).toBe('12345678901')
  })

  it('should set email', () => {
    useAuthStore.getState().setEmail('test@test.com')
    expect(useAuthStore.getState().email).toBe('test@test.com')
  })

  it('should logout and clear all state', () => {
    useAuthStore.getState().setToken('abc123')
    useAuthStore.getState().setUser({ id: '1', cpf: '123', email: 'a@b.com' })
    useAuthStore.getState().setCpf('123')
    useAuthStore.getState().setEmail('a@b.com')

    useAuthStore.getState().logout()

    const state = useAuthStore.getState()
    expect(state.token).toBeNull()
    expect(state.user).toBeNull()
    expect(state.cpf).toBeNull()
    expect(state.email).toBeNull()
  })

  it('should return false for isAuthenticated when no token', () => {
    expect(useAuthStore.getState().isAuthenticated()).toBe(false)
  })

  it('should return true for isAuthenticated when token exists', () => {
    useAuthStore.getState().setToken('valid-token')
    expect(useAuthStore.getState().isAuthenticated()).toBe(true)
  })
})
