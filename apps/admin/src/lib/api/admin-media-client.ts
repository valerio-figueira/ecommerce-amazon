'use client';

import { uploadAdminImageResponseSchema } from '@ecommerce-amazon/shared/admin';

export async function uploadAdminImageClient(file: Blob): Promise<string> {
  const formData = new FormData();
  formData.append('image', file, 'image.jpg');

  const response = await fetch('/api/admin/media/images', {
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
        : 'Falha ao enviar imagem';
    throw new Error(message);
  }

  const data: unknown = await response.json();
  const parsed = uploadAdminImageResponseSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error('Resposta inválida do servidor');
  }
  return parsed.data.url;
}
