export const AIRLINES = [
  { value: 'GOL', label: 'Gol Linhas Aéreas' },
  { value: 'LATAM', label: 'LATAM Airlines' },
  { value: 'AZUL', label: 'Azul Linhas Aéreas' },
  { value: 'AVIANCA', label: 'Avianca Brasil' },
  { value: 'OTHER', label: 'Outra' },
] as const

export type AirlineValue = typeof AIRLINES[number]['value']
