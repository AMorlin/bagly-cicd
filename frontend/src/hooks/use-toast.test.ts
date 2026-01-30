import { describe, it, expect } from 'vitest'
import { reducer } from './use-toast'

describe('toast reducer', () => {
  const mockToast = { id: '1', open: true } as any

  it('should add a toast with ADD_TOAST', () => {
    const state = { toasts: [] }
    const result = reducer(state, { type: 'ADD_TOAST', toast: mockToast })

    expect(result.toasts).toHaveLength(1)
    expect(result.toasts[0]).toEqual(mockToast)
  })

  it('should limit toasts to TOAST_LIMIT (1)', () => {
    const state = { toasts: [] }
    const first = reducer(state, { type: 'ADD_TOAST', toast: { ...mockToast, id: '1' } })
    const second = reducer(first, { type: 'ADD_TOAST', toast: { ...mockToast, id: '2' } })

    expect(second.toasts).toHaveLength(1)
    expect(second.toasts[0].id).toBe('2')
  })

  it('should update a toast with UPDATE_TOAST', () => {
    const state = { toasts: [mockToast] }
    const result = reducer(state, {
      type: 'UPDATE_TOAST',
      toast: { id: '1', title: 'Updated' },
    })

    expect(result.toasts[0].title).toBe('Updated')
    expect(result.toasts[0].open).toBe(true)
  })

  it('should not update non-matching toast', () => {
    const state = { toasts: [mockToast] }
    const result = reducer(state, {
      type: 'UPDATE_TOAST',
      toast: { id: '999', title: 'Updated' },
    })

    expect(result.toasts[0].title).toBeUndefined()
  })

  it('should set open to false on DISMISS_TOAST with id', () => {
    const state = { toasts: [mockToast] }
    const result = reducer(state, { type: 'DISMISS_TOAST', toastId: '1' })

    expect(result.toasts[0].open).toBe(false)
  })

  it('should dismiss all toasts when no id provided', () => {
    const state = {
      toasts: [
        { ...mockToast, id: '1' },
        { ...mockToast, id: '2' },
      ],
    }
    const result = reducer(state, { type: 'DISMISS_TOAST' })

    result.toasts.forEach((t: any) => expect(t.open).toBe(false))
  })

  it('should remove a toast with REMOVE_TOAST', () => {
    const state = { toasts: [mockToast] }
    const result = reducer(state, { type: 'REMOVE_TOAST', toastId: '1' })

    expect(result.toasts).toHaveLength(0)
  })

  it('should remove all toasts when REMOVE_TOAST has no id', () => {
    const state = {
      toasts: [
        { ...mockToast, id: '1' },
        { ...mockToast, id: '2' },
      ],
    }
    const result = reducer(state, { type: 'REMOVE_TOAST' })

    expect(result.toasts).toHaveLength(0)
  })
})
