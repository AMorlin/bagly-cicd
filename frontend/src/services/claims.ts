import { api } from './api'

export interface Claim {
  id: string
  protocol: string
  status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  fullName: string
  cpf: string
  phone: string
  email: string
  airline: string
  airportCode: string
  airportName: string
  flightDate: string
  locator: string
  baggageSize: 'SMALL' | 'MEDIUM' | 'LARGE'
  milesClub?: string
  milesNumber?: string
  damageDescription: string
  baggageContents: string
  images: { id: string; url: string }[]
  proposalText?: string
  proposalValue?: number
  proposalStatus?: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  createdAt: string
  updatedAt: string
}

export interface CreateClaimData {
  fullName: string
  cpf: string
  phone: string
  email: string
  airline: string
  airportCode: string
  flightDate: string
  locator: string
  baggageSize: string
  milesClub?: string
  milesNumber?: string
  damageDescription: string
  baggageContents: string
  images: string[]
}

export async function getClaims(): Promise<Claim[]> {
  const { data } = await api.get<Claim[]>('/claims')
  return data
}

export async function getClaimById(id: string): Promise<Claim> {
  const { data } = await api.get<Claim>(`/claims/${id}`)
  return data
}

export async function createClaim(claimData: CreateClaimData): Promise<Claim> {
  const { data } = await api.post<Claim>('/claims', claimData)
  return data
}

export async function uploadImages(files: File[]): Promise<{ urls: string[] }> {
  const formData = new FormData()
  files.forEach((file) => {
    formData.append('files', file)
  })
  const { data } = await api.post<{ urls: string[] }>('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return data
}
