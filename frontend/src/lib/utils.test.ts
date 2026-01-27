import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn (classnames utility)', () => {
  it('should merge single class', () => {
    expect(cn('text-red-500')).toBe('text-red-500')
  })

  it('should merge multiple classes', () => {
    expect(cn('text-red-500', 'bg-blue-500')).toBe('text-red-500 bg-blue-500')
  })

  it('should handle conditional classes', () => {
    const isActive = true
    const isDisabled = false
    expect(cn('base', isActive && 'active', isDisabled && 'disabled')).toBe('base active')
  })

  it('should handle undefined and null', () => {
    expect(cn('base', undefined, null, 'extra')).toBe('base extra')
  })

  it('should handle empty string', () => {
    expect(cn('base', '', 'extra')).toBe('base extra')
  })

  it('should merge tailwind classes correctly', () => {
    // twMerge should handle conflicting classes
    expect(cn('px-2', 'px-4')).toBe('px-4')
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })

  it('should handle array of classes', () => {
    expect(cn(['text-sm', 'font-bold'])).toBe('text-sm font-bold')
  })

  it('should handle object syntax', () => {
    expect(cn({ 'text-red-500': true, 'text-blue-500': false })).toBe('text-red-500')
  })

  it('should handle mixed inputs', () => {
    expect(cn('base', ['array-class'], { 'obj-class': true })).toBe('base array-class obj-class')
  })

  it('should return empty string for no args', () => {
    expect(cn()).toBe('')
  })

  it('should handle complex tailwind merging', () => {
    expect(cn('p-4 px-2')).toBe('p-4 px-2')
    expect(cn('hover:bg-red-500', 'hover:bg-blue-500')).toBe('hover:bg-blue-500')
  })

  it('should preserve non-conflicting classes', () => {
    expect(cn('text-lg', 'font-bold', 'text-center')).toBe('text-lg font-bold text-center')
  })
})
