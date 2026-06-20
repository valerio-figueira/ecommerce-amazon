import { ZodError } from 'zod';

import { isServiceUnavailableError, isUnauthorizedError } from '@/lib/api/admin-errors';

const MARKETPLACE_CREDENTIAL_FIELD_LABELS: Record<string, string> = {
  accessKeyId: 'Access Key ID',
  secretAccessKey: 'Secret Key',
  partnerId: 'Partner ID',
  partnerKey: 'Partner Key',
};

function formatZodErrorMessage(error: ZodError): string {
  const issue = error.issues[0];
  if (!issue) {
    return 'Dados inválidos';
  }

  const fieldKey = String(issue.path.at(-1) ?? '');
  const label = MARKETPLACE_CREDENTIAL_FIELD_LABELS[fieldKey] ?? fieldKey;

  if (issue.code === 'too_small' && issue.type === 'string') {
    return `${label} deve ter pelo menos ${issue.minimum} caracteres.`;
  }

  if (issue.code === 'too_big' && issue.type === 'string') {
    return `${label} deve ter no máximo ${issue.maximum} caracteres.`;
  }

  return issue.message;
}

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
  if (error instanceof ZodError) {
    return formatZodErrorMessage(error);
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Request failed';
}

export { isServiceUnavailableError, isUnauthorizedError } from '@/lib/api/admin-errors';
