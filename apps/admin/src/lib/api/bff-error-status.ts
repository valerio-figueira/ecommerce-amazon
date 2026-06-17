import {
  isServiceUnavailableError,
  isUnauthorizedError,
} from '@/lib/api/admin-errors';

export function getBffErrorStatus(error: unknown): number {
  if (isUnauthorizedError(error)) {
    return 401;
  }
  if (isServiceUnavailableError(error)) {
    return 503;
  }
  return 500;
}

export function resolveBffStatus(error: unknown, fallbackStatus: number): number {
  if (isUnauthorizedError(error)) {
    return 401;
  }
  if (isServiceUnavailableError(error)) {
    return 503;
  }
  return fallbackStatus;
}

export function getBffErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Request failed';
}

export { isServiceUnavailableError, isUnauthorizedError } from '@/lib/api/admin-errors';
