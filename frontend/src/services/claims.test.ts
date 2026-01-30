import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getClaims, getClaimById, createClaim, uploadImages } from './claims'

vi.mock('./api', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

import { api } from './api'

describe('claims service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getClaims', () => {
    it('should call GET /claims', async () => {
      const mockClaims = [{ id: '1', protocol: 'P001', status: 'IN_PROGRESS' }]
      vi.mocked(api.get).mockResolvedValue({ data: mockClaims })

      const result = await getClaims()

      expect(api.get).toHaveBeenCalledWith('/claims')
      expect(result).toEqual(mockClaims)
    })
  })

  describe('getClaimById', () => {
    it('should call GET /claims/:id', async () => {
      const mockClaim = { id: '1', protocol: 'P001', status: 'IN_PROGRESS' }
      vi.mocked(api.get).mockResolvedValue({ data: mockClaim })

      const result = await getClaimById('1')

      expect(api.get).toHaveBeenCalledWith('/claims/1')
      expect(result).toEqual(mockClaim)
    })
  })

  describe('createClaim', () => {
    it('should call POST /claims with claim data', async () => {
      const claimData = {
        fullName: 'John Doe',
        cpf: '12345678901',
        phone: '11999999999',
        email: 'john@test.com',
        airline: 'GOL',
        airportCode: 'GRU',
        flightDate: '2024-01-15',
        locator: 'ABC123',
        baggageSize: 'MEDIUM',
        damageDescription: 'Broken handle',
        baggageContents: 'Clothes',
        images: ['url1.jpg'],
      }
      const mockResponse = { id: '1', protocol: 'P001', ...claimData }
      vi.mocked(api.post).mockResolvedValue({ data: mockResponse })

      const result = await createClaim(claimData)

      expect(api.post).toHaveBeenCalledWith('/claims', claimData)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('uploadImages', () => {
    it('should call POST /upload with FormData', async () => {
      const file1 = new File(['content1'], 'img1.jpg', { type: 'image/jpeg' })
      const file2 = new File(['content2'], 'img2.jpg', { type: 'image/jpeg' })
      const mockResponse = { urls: ['url1.jpg', 'url2.jpg'] }
      vi.mocked(api.post).mockResolvedValue({ data: mockResponse })

      const result = await uploadImages([file1, file2])

      expect(api.post).toHaveBeenCalledWith('/upload', expect.any(FormData), {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      expect(result).toEqual(mockResponse)
    })

    it('should append all files to FormData', async () => {
      const file = new File(['content'], 'img.jpg', { type: 'image/jpeg' })
      vi.mocked(api.post).mockResolvedValue({ data: { urls: ['url.jpg'] } })

      await uploadImages([file])

      const formData = vi.mocked(api.post).mock.calls[0][1] as FormData
      expect(formData.getAll('files')).toHaveLength(1)
    })
  })
})
