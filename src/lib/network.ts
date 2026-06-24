export function isNetworkError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message.toLowerCase() : String(error ?? '').toLowerCase()
  if (typeof error === 'object' && error !== null) {
    const obj = error as Record<string, unknown>
    if (typeof obj.message === 'string') {
      return isNetworkErrorMessage(obj.message.toLowerCase())
    }
  }
  return isNetworkErrorMessage(msg)
}

function isNetworkErrorMessage(msg: string): boolean {
  return (
    msg.includes('failed to fetch') ||
    msg.includes('networkerror') ||
    msg.includes('network error') ||
    msg.includes('network') ||
    msg.includes('fetch') ||
    msg.includes('typeerror') ||
    msg.includes('load failed') ||
    msg.includes('internet') ||
    msg.includes('connection')
  )
}

export function isOfflineError(error: unknown): boolean {
  return isNetworkError(error) || typeof navigator !== 'undefined' && !navigator.onLine
}
