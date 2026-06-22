function hasErrorCode(error: unknown, code: string): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === code;
}

/** True for undici/node fetch failures that should not take down SSR (hairpin, API restart). */
export function isTransientFetchFailure(error: unknown): boolean {
  if (error instanceof TypeError && error.message === 'fetch failed') {
    return true;
  }

  if (error instanceof Error) {
    if (hasErrorCode(error, 'UND_ERR_CONNECT_TIMEOUT')) {
      return true;
    }
    if (hasErrorCode(error.cause, 'UND_ERR_CONNECT_TIMEOUT')) {
      return true;
    }
  }

  return false;
}
