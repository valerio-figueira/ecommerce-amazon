'use client';

import {
  operatorProfileSchema,
  updateOperatorProfileResponseSchema,
  uploadAvatarResponseSchema,
  type OperatorProfile,
  type UpdateOperatorProfileBody,
} from '@ecommerce-amazon/shared/admin';

export async function fetchOperatorProfileClient(): Promise<OperatorProfile> {
  const response = await fetch('/api/admin/profile', { cache: 'no-store' });
  if (!response.ok) {
    const payload: unknown = await response.json().catch(() => null);
    const message =
      typeof payload === 'object' &&
      payload !== null &&
      'error' in payload &&
      typeof payload.error === 'string'
        ? payload.error
        : 'Falha ao carregar perfil';
    throw new Error(message);
  }

  const data: unknown = await response.json();
  return operatorProfileSchema.parse(data);
}

export async function updateOperatorProfileClient(
  body: UpdateOperatorProfileBody,
): Promise<OperatorProfile> {
  const response = await fetch('/api/admin/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const payload: unknown = await response.json().catch(() => null);
    const message =
      typeof payload === 'object' &&
      payload !== null &&
      'error' in payload &&
      typeof payload.error === 'string'
        ? payload.error
        : 'Falha ao salvar perfil';
    throw new Error(message);
  }

  const data: unknown = await response.json();
  const parsed = updateOperatorProfileResponseSchema.parse(data);
  return parsed.operator;
}

export async function uploadOperatorAvatarClient(file: Blob): Promise<string> {
  const formData = new FormData();
  formData.append('avatar', file, 'avatar.jpg');

  const response = await fetch('/api/admin/profile/avatar', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const payload: unknown = await response.json().catch(() => null);
    const message =
      typeof payload === 'object' &&
      payload !== null &&
      'error' in payload &&
      typeof payload.error === 'string'
        ? payload.error
        : 'Falha ao enviar foto';
    throw new Error(message);
  }

  const data: unknown = await response.json();
  return uploadAvatarResponseSchema.parse(data).avatarUrl;
}

export async function removeOperatorAvatarClient(): Promise<void> {
  const response = await fetch('/api/admin/profile/avatar', { method: 'DELETE' });
  if (!response.ok) {
    const payload: unknown = await response.json().catch(() => null);
    const message =
      typeof payload === 'object' &&
      payload !== null &&
      'error' in payload &&
      typeof payload.error === 'string'
        ? payload.error
        : 'Falha ao remover foto';
    throw new Error(message);
  }
}
