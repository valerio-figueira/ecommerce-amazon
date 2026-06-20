export async function readClientErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  const payload: unknown = await response.json().catch(() => null);
  if (
    typeof payload === 'object' &&
    payload !== null &&
    'error' in payload &&
    typeof payload.error === 'string'
  ) {
    return payload.error;
  }
  return fallback;
}

export function readMetadataString(
  metadata: Record<string, unknown>,
  key: string,
): string {
  const value = metadata[key];
  return typeof value === 'string' ? value : '';
}
