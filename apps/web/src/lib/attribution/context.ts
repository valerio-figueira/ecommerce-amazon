import { z } from 'zod';

const STORAGE_KEY = 'vitrine_attribution';
const TTL_MS = 30 * 60 * 1000;

const storedAttributionSchema = z.object({
  entryPath: z.string(),
  entryPlacement: z.string(),
  blockId: z.string().optional(),
  setAt: z.number(),
});

export type AttributionContext = z.infer<typeof storedAttributionSchema>;

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function readStored(): AttributionContext | null {
  if (!isBrowser()) return null;

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = storedAttributionSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }

    if (Date.now() - parsed.data.setAt > TTL_MS) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return parsed.data;
  } catch {
    return null;
  }
}

export function setAttribution(input: {
  entryPath: string;
  entryPlacement: string;
  blockId?: string;
}): void {
  if (!isBrowser()) return;

  const payload: AttributionContext = {
    entryPath: input.entryPath,
    entryPlacement: input.entryPlacement,
    setAt: Date.now(),
    ...(input.blockId !== undefined ? { blockId: input.blockId } : {}),
  };

  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function getAttribution(): AttributionContext | null {
  return readStored();
}

export function clearAttribution(): void {
  if (!isBrowser()) return;
  sessionStorage.removeItem(STORAGE_KEY);
}

export function resolveReferrerPath(explicit?: string): string | undefined {
  if (explicit) return explicit;
  return getAttribution()?.entryPath;
}
