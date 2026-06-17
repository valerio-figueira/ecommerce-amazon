export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ServiceUnavailableError extends Error {
  constructor(message = 'Service temporarily unavailable') {
    super(message);
    this.name = 'ServiceUnavailableError';
  }
}

export function isUnauthorizedError(error: unknown): boolean {
  return error instanceof UnauthorizedError;
}

export function isServiceUnavailableError(error: unknown): boolean {
  return error instanceof ServiceUnavailableError;
}
