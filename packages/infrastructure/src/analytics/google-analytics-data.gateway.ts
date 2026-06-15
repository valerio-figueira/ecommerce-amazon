import { BetaAnalyticsDataClient } from '@google-analytics/data';

import type { Ga4AnalyticsGateway, Ga4TrafficReport } from '@ecommerce-amazon/domain';

function formatGaDate(date: Date): string {
  return date.toISOString().slice(0, 10).replace(/-/g, '');
}

function toSharePercent(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 1000) / 10;
}

type Ga4GatewayConfig = {
  propertyId: string;
  credentials: Record<string, unknown>;
};

function readGa4Config(): Ga4GatewayConfig | null {
  const propertyId = process.env['GA4_PROPERTY_ID']?.trim();
  const rawCredentials = process.env['GA4_SERVICE_ACCOUNT_JSON']?.trim();
  if (!propertyId || !rawCredentials) {
    return null;
  }

  try {
    const credentials = JSON.parse(rawCredentials) as Record<string, unknown>;
    return { propertyId, credentials };
  } catch {
    return null;
  }
}

export class GoogleAnalyticsDataGateway implements Ga4AnalyticsGateway {
  private readonly client: BetaAnalyticsDataClient | null;
  private readonly propertyId: string | null;

  constructor() {
    const config = readGa4Config();
    if (!config) {
      this.client = null;
      this.propertyId = null;
      return;
    }

    this.client = new BetaAnalyticsDataClient({ credentials: config.credentials });
    this.propertyId = config.propertyId;
  }

  isConfigured(): boolean {
    return this.client !== null && this.propertyId !== null;
  }

  async getTrafficAcquisition(from: Date, to: Date): Promise<Ga4TrafficReport | null> {
    if (!this.client || !this.propertyId) {
      return null;
    }

    const [response] = await this.client.runReport({
      property: `properties/${this.propertyId}`,
      dateRanges: [{ startDate: formatGaDate(from), endDate: formatGaDate(to) }],
      dimensions: [{ name: 'sessionDefaultChannelGroup' }],
      metrics: [{ name: 'screenPageViews' }],
      orderBys: [{ desc: true, metric: { metricName: 'screenPageViews' } }],
    });

    const rows = response.rows ?? [];
    const acquisition = rows.map((row) => ({
      channel: row.dimensionValues?.[0]?.value ?? 'unknown',
      pageViews: Number(row.metricValues?.[0]?.value ?? 0),
      sharePercent: 0,
    }));

    const totalPageViews = acquisition.reduce((sum, row) => sum + row.pageViews, 0);
    return {
      totalPageViews,
      acquisition: acquisition.map((row) => ({
        ...row,
        sharePercent: toSharePercent(row.pageViews, totalPageViews),
      })),
    };
  }

  async getEventCountsByParam(
    eventName: string,
    paramName: string,
    from: Date,
    to: Date,
  ): Promise<Record<string, number>> {
    if (!this.client || !this.propertyId) {
      return {};
    }

    const [response] = await this.client.runReport({
      property: `properties/${this.propertyId}`,
      dateRanges: [{ startDate: formatGaDate(from), endDate: formatGaDate(to) }],
      dimensions: [{ name: 'customEvent:click_origin' }],
      metrics: [{ name: 'eventCount' }],
      dimensionFilter: {
        filter: {
          fieldName: 'eventName',
          stringFilter: { value: eventName },
        },
      },
    });

    const counts: Record<string, number> = {};
    for (const row of response.rows ?? []) {
      const key = row.dimensionValues?.[0]?.value;
      if (!key) continue;
      counts[key] = Number(row.metricValues?.[0]?.value ?? 0);
    }

    void paramName;
    return counts;
  }
}

export class NoOpGa4AnalyticsGateway implements Ga4AnalyticsGateway {
  isConfigured(): boolean {
    return false;
  }

  async getTrafficAcquisition(): Promise<Ga4TrafficReport | null> {
    return null;
  }

  async getEventCountsByParam(): Promise<Record<string, number>> {
    return {};
  }
}
