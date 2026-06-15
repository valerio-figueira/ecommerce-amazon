import { createHash } from 'node:crypto';

import type { Redis } from 'ioredis';

import { ClickOrigin } from '@ecommerce-amazon/domain';
import type {
  ClickEventPayload,
  EngagementEventPayload,
  PendingTelemetryAggregates,
  TelemetryBufferStore,
} from '@ecommerce-amazon/domain';

const BUFFER_CLICKS = 'telemetry:buffer:clicks';
const BUFFER_CLICKS_PROCESSING = 'telemetry:buffer:clicks:processing';
const BUFFER_ENGAGEMENT = 'telemetry:buffer:engagement';
const BUFFER_ENGAGEMENT_PROCESSING = 'telemetry:buffer:engagement:processing';
const PAGE_PATHS_HASH = 'telemetry:pending:pagepaths';

const PENDING_TTL_SECONDS = 10 * 24 * 60 * 60;

export function formatTelemetryDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function hashPagePath(pagePath: string): string {
  return createHash('sha256').update(pagePath).digest('hex').slice(0, 16);
}

function isArticleAffiliateClick(event: ClickEventPayload): boolean {
  if (!event.articleId) return false;
  return event.origin === ClickOrigin.EMBED || event.origin === ClickOrigin.COMPARISON;
}

function isDashboardClick(event: ClickEventPayload): boolean {
  return event.origin !== ClickOrigin.REDIRECT_GO;
}

function engagementArticleKey(eventType: string, articleId: string): string {
  return `${eventType}:${articleId}`;
}

export class RedisTelemetryBufferStore implements TelemetryBufferStore {
  constructor(
    private readonly redis: Redis,
    private readonly maxBufferLen: number,
  ) {}

  async pushClick(event: ClickEventPayload): Promise<void> {
    const pipeline = this.redis.pipeline();
    pipeline.lpush(BUFFER_CLICKS, JSON.stringify(event));
    this.applyClickIncrements(pipeline, event);
    await pipeline.exec();
    await this.redis.ltrim(BUFFER_CLICKS, 0, this.maxBufferLen - 1);
  }

  async pushEngagement(event: EngagementEventPayload): Promise<void> {
    const pipeline = this.redis.pipeline();
    pipeline.lpush(BUFFER_ENGAGEMENT, JSON.stringify(event));
    this.applyEngagementIncrements(pipeline, event);
    await pipeline.exec();
    await this.redis.ltrim(BUFFER_ENGAGEMENT, 0, this.maxBufferLen - 1);
  }

  async drainClicks(limit: number): Promise<ClickEventPayload[]> {
    return this.drain(BUFFER_CLICKS, BUFFER_CLICKS_PROCESSING, limit, parseClickEvent);
  }

  async drainEngagement(limit: number): Promise<EngagementEventPayload[]> {
    return this.drain(BUFFER_ENGAGEMENT, BUFFER_ENGAGEMENT_PROCESSING, limit, parseEngagementEvent);
  }

  async requeueClicks(events: ClickEventPayload[]): Promise<void> {
    await this.requeue(BUFFER_CLICKS, BUFFER_CLICKS_PROCESSING, events);
  }

  async requeueEngagement(events: EngagementEventPayload[]): Promise<void> {
    await this.requeue(BUFFER_ENGAGEMENT, BUFFER_ENGAGEMENT_PROCESSING, events);
  }

  async confirmDrainClicks(events: ClickEventPayload[]): Promise<void> {
    await this.confirmDrain(BUFFER_CLICKS_PROCESSING, events, (pipeline, event) => {
      this.applyClickDecrements(pipeline, event);
    });
  }

  async confirmDrainEngagement(events: EngagementEventPayload[]): Promise<void> {
    await this.confirmDrain(BUFFER_ENGAGEMENT_PROCESSING, events, (pipeline, event) => {
      this.applyEngagementDecrements(pipeline, event);
    });
  }

  async getPendingAggregates(from: Date, to: Date): Promise<PendingTelemetryAggregates> {
    const days = listDaysInRange(from, to);
    const clicksByOrigin: Record<string, number> = {};
    const clicksByPlacement: Record<string, number> = {};
    const clicksByBlockId: Record<string, number> = {};
    const clicksByPagePath: Record<string, number> = {};
    const clicksTrendByOrigin: PendingTelemetryAggregates['clicksTrendByOrigin'] = [];
    const clicksTrendByDay: PendingTelemetryAggregates['clicksTrendByDay'] = [];
    const engagementByType: Record<string, number> = {};
    const engagementByArticleAndType: Record<string, number> = {};
    const affiliateClicksByArticle: Record<string, number> = {};
    const affiliateClicksByArticleAndOrigin: Record<string, number> = {};
    const clicksByProductId: Record<string, number> = {};
    const clicksByMarketplace: Record<string, number> = {};

    let totalClickCount = 0;
    let pendingEventCount = 0;
    let embedAffiliateClicks = 0;

    const pageHashes = await this.redis.hgetall(PAGE_PATHS_HASH);

    for (const day of days) {
      const dayTotalKey = pendingKey('events', 'day', day, 'total');
      const dayClickTotalKey = pendingKey('clicks', 'day', day, 'total');
      const dayEmbedKey = pendingKey('clicks', 'day', day, 'article_affiliate_total');

      const [dayEvents, dayClicks, dayEmbed] = await this.redis.mget(
        dayTotalKey,
        dayClickTotalKey,
        dayEmbedKey,
      );

      pendingEventCount += Number(dayEvents ?? 0);
      const dayClickCount = Number(dayClicks ?? 0);
      totalClickCount += dayClickCount;
      embedAffiliateClicks += Number(dayEmbed ?? 0);

      if (dayClickCount > 0) {
        clicksTrendByDay.push({ date: day, count: dayClickCount });
      }

      const originPattern = pendingKey('clicks', 'day', day, 'origin', '*');
      const originKeys = await this.scanKeys(originPattern);
      for (const key of originKeys) {
        const origin = key.split(':').pop() ?? 'unknown';
        const value = Number((await this.redis.get(key)) ?? 0);
        if (value <= 0) continue;
        clicksByOrigin[origin] = (clicksByOrigin[origin] ?? 0) + value;
        clicksTrendByOrigin.push({ date: day, origin, count: value });
      }

      const placementPattern = pendingKey('clicks', 'day', day, 'placement', '*');
      const placementKeys = await this.scanKeys(placementPattern);
      for (const key of placementKeys) {
        const placement = key.split(':').pop() ?? 'unknown';
        const value = Number((await this.redis.get(key)) ?? 0);
        if (value <= 0) continue;
        clicksByPlacement[placement] = (clicksByPlacement[placement] ?? 0) + value;
      }

      const blockPattern = pendingKey('clicks', 'day', day, 'block', '*');
      const blockKeys = await this.scanKeys(blockPattern);
      for (const key of blockKeys) {
        const blockId = key.split(':').pop() ?? 'unknown';
        const value = Number((await this.redis.get(key)) ?? 0);
        if (value <= 0) continue;
        clicksByBlockId[blockId] = (clicksByBlockId[blockId] ?? 0) + value;
      }

      const pagePattern = pendingKey('clicks', 'day', day, 'page', '*');
      const pageKeys = await this.scanKeys(pagePattern);
      for (const key of pageKeys) {
        const pageHash = key.split(':').pop() ?? 'unknown';
        const value = Number((await this.redis.get(key)) ?? 0);
        if (value <= 0) continue;
        const pagePath = pageHashes[pageHash] ?? pageHash;
        clicksByPagePath[pagePath] = (clicksByPagePath[pagePath] ?? 0) + value;
      }

      const articleAffiliatePattern = pendingKey('clicks', 'day', day, 'article_affiliate', '*');
      const articleAffiliateKeys = await this.scanKeys(articleAffiliatePattern);
      for (const key of articleAffiliateKeys) {
        const articleId = key.split(':').pop() ?? 'unknown';
        const value = Number((await this.redis.get(key)) ?? 0);
        if (value <= 0) continue;
        affiliateClicksByArticle[articleId] = (affiliateClicksByArticle[articleId] ?? 0) + value;
      }

      const articleAffiliateOriginPattern = pendingKey(
        'clicks',
        'day',
        day,
        'article_affiliate_origin',
        '*',
      );
      const articleAffiliateOriginKeys = await this.scanKeys(articleAffiliateOriginPattern);
      for (const key of articleAffiliateOriginKeys) {
        const compositeKey = key.split(':').slice(-2).join(':');
        const value = Number((await this.redis.get(key)) ?? 0);
        if (value <= 0) continue;
        affiliateClicksByArticleAndOrigin[compositeKey] =
          (affiliateClicksByArticleAndOrigin[compositeKey] ?? 0) + value;
      }

      const productPattern = pendingKey('clicks', 'day', day, 'product', '*');
      const productKeys = await this.scanKeys(productPattern);
      for (const key of productKeys) {
        const productId = key.split(':').pop() ?? 'unknown';
        const value = Number((await this.redis.get(key)) ?? 0);
        if (value <= 0) continue;
        clicksByProductId[productId] = (clicksByProductId[productId] ?? 0) + value;
      }

      const marketplacePattern = pendingKey('clicks', 'day', day, 'marketplace', '*');
      const marketplaceKeys = await this.scanKeys(marketplacePattern);
      for (const key of marketplaceKeys) {
        const marketplace = key.split(':').pop() ?? 'unknown';
        const value = Number((await this.redis.get(key)) ?? 0);
        if (value <= 0) continue;
        clicksByMarketplace[marketplace] = (clicksByMarketplace[marketplace] ?? 0) + value;
      }

      const engagementPrefix = `${pendingKey('engagement', 'day', day)}:`;
      const engagementPattern = `${engagementPrefix}*`;
      const engagementKeys = await this.scanKeys(engagementPattern);
      for (const key of engagementKeys) {
        if (!key.startsWith(engagementPrefix)) continue;
        const suffix = key.slice(engagementPrefix.length);
        const value = Number((await this.redis.get(key)) ?? 0);
        if (value <= 0) continue;

        if (suffix.startsWith('article:')) {
          const [, eventType, articleId] = suffix.split(':');
          if (!eventType || !articleId) continue;
          const compositeKey = engagementArticleKey(eventType, articleId);
          engagementByArticleAndType[compositeKey] =
            (engagementByArticleAndType[compositeKey] ?? 0) + value;
          continue;
        }

        engagementByType[suffix] = (engagementByType[suffix] ?? 0) + value;
      }
    }

    return {
      totalClickCount,
      pendingEventCount,
      clicksByOrigin,
      clicksByPlacement,
      clicksByBlockId,
      clicksByPagePath,
      clicksTrendByOrigin,
      clicksTrendByDay,
      engagementByType,
      engagementByArticleAndType,
      embedAffiliateClicks,
      affiliateClicksByArticle,
      affiliateClicksByArticleAndOrigin,
      clicksByProductId,
      clicksByMarketplace,
    };
  }

  private async drain<T>(
    sourceKey: string,
    processingKey: string,
    limit: number,
    parser: (raw: string) => T | null,
  ): Promise<T[]> {
    const events: T[] = [];
    for (let index = 0; index < limit; index += 1) {
      const raw = await this.redis.lmove(sourceKey, processingKey, 'RIGHT', 'LEFT');
      if (!raw) break;
      const parsed = parser(raw);
      if (parsed) events.push(parsed);
    }
    return events;
  }

  private async requeue<T>(sourceKey: string, processingKey: string, events: T[]): Promise<void> {
    if (events.length === 0) {
      await this.redis.del(processingKey);
      return;
    }

    const pipeline = this.redis.pipeline();
    for (const event of [...events].reverse()) {
      pipeline.lpush(sourceKey, JSON.stringify(event));
    }
    pipeline.del(processingKey);
    await pipeline.exec();
  }

  private async confirmDrain<T>(
    processingKey: string,
    events: T[],
    applyDecrements: (pipeline: ReturnType<Redis['pipeline']>, event: T) => void,
  ): Promise<void> {
    if (events.length === 0) {
      await this.redis.del(processingKey);
      return;
    }

    const pipeline = this.redis.pipeline();
    for (const event of events) {
      applyDecrements(pipeline, event);
    }
    pipeline.del(processingKey);
    await pipeline.exec();
  }

  private applyClickIncrements(
    pipeline: ReturnType<Redis['pipeline']>,
    event: ClickEventPayload,
  ): void {
    const day = formatTelemetryDay(new Date(event.occurredAt));
    this.incrWithTtl(pipeline, pendingKey('events', 'day', day, 'total'));

    if (!isDashboardClick(event)) {
      return;
    }

    this.incrWithTtl(pipeline, pendingKey('clicks', 'day', day, 'total'));
    this.incrWithTtl(pipeline, pendingKey('clicks', 'day', day, 'origin', event.origin));
    this.incrWithTtl(pipeline, pendingKey('clicks', 'day', day, 'product', event.productId));

    if (event.marketplace) {
      this.incrWithTtl(
        pipeline,
        pendingKey('clicks', 'day', day, 'marketplace', event.marketplace),
      );
    }

    if (event.placement) {
      this.incrWithTtl(
        pipeline,
        pendingKey('clicks', 'day', day, 'placement', event.placement),
      );
    }

    if (event.blockId) {
      this.incrWithTtl(pipeline, pendingKey('clicks', 'day', day, 'block', event.blockId));
    }

    if (event.pagePath) {
      const pageHash = hashPagePath(event.pagePath);
      pipeline.hset(PAGE_PATHS_HASH, pageHash, event.pagePath);
      pipeline.expire(PAGE_PATHS_HASH, PENDING_TTL_SECONDS);
      this.incrWithTtl(pipeline, pendingKey('clicks', 'day', day, 'page', pageHash));
    }

    if (isArticleAffiliateClick(event) && event.articleId) {
      this.incrWithTtl(pipeline, pendingKey('clicks', 'day', day, 'article_affiliate_total'));
      this.incrWithTtl(
        pipeline,
        pendingKey('clicks', 'day', day, 'article_affiliate', event.articleId),
      );
      this.incrWithTtl(
        pipeline,
        pendingKey(
          'clicks',
          'day',
          day,
          'article_affiliate_origin',
          `${event.articleId}:${event.origin}`,
        ),
      );
    }
  }

  private applyClickDecrements(
    pipeline: ReturnType<Redis['pipeline']>,
    event: ClickEventPayload,
  ): void {
    const day = formatTelemetryDay(new Date(event.occurredAt));
    this.decrWithCleanup(pipeline, pendingKey('events', 'day', day, 'total'));

    if (!isDashboardClick(event)) {
      return;
    }

    this.decrWithCleanup(pipeline, pendingKey('clicks', 'day', day, 'total'));
    this.decrWithCleanup(pipeline, pendingKey('clicks', 'day', day, 'origin', event.origin));
    this.decrWithCleanup(pipeline, pendingKey('clicks', 'day', day, 'product', event.productId));

    if (event.marketplace) {
      this.decrWithCleanup(
        pipeline,
        pendingKey('clicks', 'day', day, 'marketplace', event.marketplace),
      );
    }

    if (event.placement) {
      this.decrWithCleanup(
        pipeline,
        pendingKey('clicks', 'day', day, 'placement', event.placement),
      );
    }

    if (event.blockId) {
      this.decrWithCleanup(pipeline, pendingKey('clicks', 'day', day, 'block', event.blockId));
    }

    if (event.pagePath) {
      const pageHash = hashPagePath(event.pagePath);
      this.decrWithCleanup(pipeline, pendingKey('clicks', 'day', day, 'page', pageHash));
    }

    if (isArticleAffiliateClick(event) && event.articleId) {
      this.decrWithCleanup(pipeline, pendingKey('clicks', 'day', day, 'article_affiliate_total'));
      this.decrWithCleanup(
        pipeline,
        pendingKey('clicks', 'day', day, 'article_affiliate', event.articleId),
      );
      this.decrWithCleanup(
        pipeline,
        pendingKey(
          'clicks',
          'day',
          day,
          'article_affiliate_origin',
          `${event.articleId}:${event.origin}`,
        ),
      );
    }
  }

  private applyEngagementIncrements(
    pipeline: ReturnType<Redis['pipeline']>,
    event: EngagementEventPayload,
  ): void {
    const day = formatTelemetryDay(new Date(event.occurredAt));
    this.incrWithTtl(pipeline, pendingKey('events', 'day', day, 'total'));
    this.incrWithTtl(pipeline, pendingKey('engagement', 'day', day, event.eventType));
    this.incrWithTtl(
      pipeline,
      pendingKey('engagement', 'day', day, 'article', event.eventType, event.articleId),
    );
  }

  private applyEngagementDecrements(
    pipeline: ReturnType<Redis['pipeline']>,
    event: EngagementEventPayload,
  ): void {
    const day = formatTelemetryDay(new Date(event.occurredAt));
    this.decrWithCleanup(pipeline, pendingKey('events', 'day', day, 'total'));
    this.decrWithCleanup(pipeline, pendingKey('engagement', 'day', day, event.eventType));
    this.decrWithCleanup(
      pipeline,
      pendingKey('engagement', 'day', day, 'article', event.eventType, event.articleId),
    );
  }

  private incrWithTtl(pipeline: ReturnType<Redis['pipeline']>, key: string): void {
    pipeline.incr(key);
    pipeline.expire(key, PENDING_TTL_SECONDS);
  }

  private decrWithCleanup(pipeline: ReturnType<Redis['pipeline']>, key: string): void {
    pipeline.decr(key);
  }

  private async scanKeys(pattern: string): Promise<string[]> {
    const keys: string[] = [];
    let cursor = '0';
    do {
      const [nextCursor, batch] = await this.redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = nextCursor;
      keys.push(...batch);
    } while (cursor !== '0');
    return keys;
  }
}

function pendingKey(...parts: string[]): string {
  return `telemetry:pending:${parts.join(':')}`;
}

function listDaysInRange(from: Date, to: Date): string[] {
  const days: string[] = [];
  const cursor = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()));
  const end = new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate()));

  while (cursor <= end) {
    days.push(formatTelemetryDay(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return days;
}

function parseClickEvent(raw: string): ClickEventPayload | null {
  try {
    return JSON.parse(raw) as ClickEventPayload;
  } catch {
    return null;
  }
}

function parseEngagementEvent(raw: string): EngagementEventPayload | null {
  try {
    return JSON.parse(raw) as EngagementEventPayload;
  } catch {
    return null;
  }
}
