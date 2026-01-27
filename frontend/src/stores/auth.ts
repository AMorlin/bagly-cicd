import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  cpf: string
  email: string
  name?: string
  phone?: string
}

interface AuthState {
  token: string | null
  user: User | null
  cpf: string | null
  email: string | null
  setToken: (token: string) => void
  setUser: (user: User) => void
  setCpf: (cpf: string) => void
  setEmail: (email: string) => void
  logout: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      cpf: null,
      email: null,
      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      setCpf: (cpf) => set({ cpf }),
      setEmail: (email) => set({ email }),
      logout: () => set({ token: null, user: null, cpf: null, email: null }),
      isAuthenticated: () => !!get().token,
    }),
    {
      name: 'bagly-auth',
    }
  )
)
