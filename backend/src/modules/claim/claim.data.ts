export const BRAZILIAN_AIRPORTS = [
  { code: 'GRU', name: 'Aeroporto Internacional de Guarulhos', city: 'São Paulo' },
  { code: 'CGH', name: 'Aeroporto de Congonhas', city: 'São Paulo' },
  { code: 'GIG', name: 'Aeroporto Internacional do Galeão', city: 'Rio de Janeiro' },
  { code: 'SDU', name: 'Aeroporto Santos Dumont', city: 'Rio de Janeiro' },
  { code: 'BSB', name: 'Aeroporto Internacional de Brasília', city: 'Brasília' },
  { code: 'CNF', name: 'Aeroporto Internacional de Confins', city: 'Belo Horizonte' },
  { code: 'SSA', name: 'Aeroporto Internacional de Salvador', city: 'Salvador' },
  { code: 'REC', name: 'Aeroporto Internacional do Recife', city: 'Recife' },
  { code: 'FOR', name: 'Aeroporto Internacional de Fortaleza', city: 'Fortaleza' },
  { code: 'POA', name: 'Aeroporto Internacional de Porto Alegre', city: 'Porto Alegre' },
  { code: 'CWB', name: 'Aeroporto Internacional de Curitiba', city: 'Curitiba' },
  { code: 'VCP', name: 'Aeroporto Internacional de Viracopos', city: 'Campinas' },
  { code: 'FLN', name: 'Aeroporto Internacional de Florianópolis', city: 'Florianópolis' },
  { code: 'MAO', name: 'Aeroporto Internacional de Manaus', city: 'Manaus' },
  { code: 'BEL', name: 'Aeroporto Internacional de Belém', city: 'Belém' },
  { code: 'NAT', name: 'Aeroporto Internacional de Natal', city: 'Natal' },
  { code: 'MCZ', name: 'Aeroporto Internacional de Maceió', city: 'Maceió' },
  { code: 'CGB', name: 'Aeroporto Internacional de Cuiabá', city: 'Cuiabá' },
  { code: 'GYN', name: 'Aeroporto de Goiânia', city: 'Goiânia' },
  { code: 'VIX', name: 'Aeroporto de Vitória', city: 'Vitória' },
] as const

export function getAirportByCode(code: string) {
  return BRAZILIAN_AIRPORTS.find((airport) => airport.code === code)
}
