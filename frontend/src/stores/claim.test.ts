import { describe, it, expect, beforeEach } from 'vitest'
import { useClaimFormStore } from './claim'

describe('useClaimFormStore', () => {
  beforeEach(() => {
    useClaimFormStore.getState().resetFormData()
  })

  it('should have empty initial form data', () => {
    const { formData } = useClaimFormStore.getState()
    expect(formData.fullName).toBe('')
    expect(formData.cpf).toBe('')
    expect(formData.phone).toBe('')
    expect(formData.email).toBe('')
    expect(formData.airline).toBe('')
    expect(formData.airportCode).toBe('')
    expect(formData.flightDate).toBe('')
    expect(formData.locator).toBe('')
    expect(formData.baggageSize).toBe('')
    expect(formData.milesClub).toBe('')
    expect(formData.milesNumber).toBe('')
    expect(formData.damageDescription).toBe('')
    expect(formData.baggageContents).toBe('')
    expect(formData.images).toEqual([])
  })

  it('should update partial form data', () => {
    useClaimFormStore.getState().updateFormData({
      fullName: 'John Doe',
      email: 'john@test.com',
    })

    const { formData } = useClaimFormStore.getState()
    expect(formData.fullName).toBe('John Doe')
    expect(formData.email).toBe('john@test.com')
    expect(formData.cpf).toBe('')
  })

  it('should merge updates without overwriting other fields', () => {
    useClaimFormStore.getState().updateFormData({ fullName: 'John' })
    useClaimFormStore.getState().updateFormData({ email: 'john@test.com' })

    const { formData } = useClaimFormStore.getState()
    expect(formData.fullName).toBe('John')
    expect(formData.email).toBe('john@test.com')
  })

  it('should reset form data to initial state', () => {
    useClaimFormStore.getState().updateFormData({
      fullName: 'John',
      cpf: '12345678901',
      airline: 'GOL',
    })

    useClaimFormStore.getState().resetFormData()

    const { formData } = useClaimFormStore.getState()
    expect(formData.fullName).toBe('')
    expect(formData.cpf).toBe('')
    expect(formData.airline).toBe('')
  })

  it('should update images array', () => {
    useClaimFormStore.getState().updateFormData({
      images: ['url1.jpg', 'url2.jpg'],
    })

    const { formData } = useClaimFormStore.getState()
    expect(formData.images).toEqual(['url1.jpg', 'url2.jpg'])
  })
})
