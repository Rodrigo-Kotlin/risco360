export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '')
}

export function normalizeCnae(value: string): string {
  return onlyDigits(value)
}

export function getCnae4(value: string): string | null {
  const digits = onlyDigits(value)
  if (digits.length < 4) return null
  return digits.slice(0, 4)
}

export function formatCnae(value: string): string {
  const digits = onlyDigits(value)
  if (digits.length < 5) return digits
  if (digits.length === 6) {
    return `${digits.slice(0, 4)}-${digits.slice(4, 5)}-${digits.slice(5)}`
  }
  if (digits.length === 7) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 4)}-${digits.slice(4, 5)}-${digits.slice(5)}`
  }
  return `${digits.slice(0, 4)}-${digits.slice(4, 5)}-${digits.slice(5)}`
}

export function isValidCnae4(value: string): boolean {
  const cnae4 = getCnae4(value)
  return cnae4 !== null && cnae4.length === 4
}
