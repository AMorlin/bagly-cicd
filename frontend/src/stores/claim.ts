import { create } from 'zustand'

interface ClaimFormData {
  fullName: string
  cpf: string
  phone: string
  email: string
  airline: string
  airportCode: string
  flightDate: string
  locator: string
  baggageSize: string
  milesClub: string
  milesNumber: string
  damageDescription: string
  baggageContents: string
  images: string[]
}

interface ClaimFormState {
  formData: ClaimFormData
  updateFormData: (data: Partial<ClaimFormData>) => void
  resetFormData: () => void
}

const initialFormData: ClaimFormData = {
  fullName: '',
  cpf: '',
  phone: '',
  email: '',
  airline: '',
  airportCode: '',
  flightDate: '',
  locator: '',
  baggageSize: '',
  milesClub: '',
  milesNumber: '',
  damageDescription: '',
  baggageContents: '',
  images: [],
}

export const useClaimFormStore = create<ClaimFormState>((set) => ({
  formData: initialFormData,
  updateFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),
  resetFormData: () => set({ formData: initialFormData }),
}))
