import {
  operationalStatusResponseSchema,
  type OperationalStatusResponse,
} from '@ecommerce-amazon/shared/admin';

import { adminFetchParsed } from './admin-fetch';

export async function getOperationalStatus(): Promise<OperationalStatusResponse> {
  return adminFetchParsed('/admin/operational-status', operationalStatusResponseSchema);
}
