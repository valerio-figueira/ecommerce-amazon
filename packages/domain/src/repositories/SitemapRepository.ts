export type SitemapEntryRecord = {
  path: string;
  lastModified: Date;
};

export interface SitemapRepository {
  countEntries(): Promise<number>;
  listEntries(offset: number, limit: number): Promise<SitemapEntryRecord[]>;
}
