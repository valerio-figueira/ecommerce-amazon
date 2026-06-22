import { ValidationError } from '../errors/DomainError.js';
import { AutoLinkApplyTo as AutoLinkApplyToEnum } from '../enums/index.js';
import { type AutoLinkId, toAutoLinkId } from '../value-objects/index.js';

const KEYWORD_MAX_LENGTH = 120;
const TARGET_URL_MAX_LENGTH = 2048;

function normalizeKeyword(keyword: string): string {
  return keyword.trim();
}

function validateTargetUrl(targetUrl: string): string {
  const trimmed = targetUrl.trim();
  if (trimmed.length === 0 || trimmed.length > TARGET_URL_MAX_LENGTH) {
    throw new ValidationError('URL de destino inválida');
  }
  if (trimmed.startsWith('/')) {
    return trimmed;
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'https:') {
      throw new ValidationError('URL de destino deve usar HTTPS');
    }
    return trimmed;
  } catch {
    throw new ValidationError('URL de destino inválida');
  }
}

function validateKeyword(keyword: string): string {
  const normalized = normalizeKeyword(keyword);
  if (normalized.length === 0 || normalized.length > KEYWORD_MAX_LENGTH) {
    throw new ValidationError('Keyword deve ter entre 1 e 120 caracteres');
  }
  return normalized;
}

function validateMaxMatches(maxMatches: number): number {
  if (!Number.isInteger(maxMatches) || maxMatches < 1) {
    throw new ValidationError('maxMatches deve ser um inteiro maior ou igual a 1');
  }
  return maxMatches;
}

function validateApplyTo(applyTo: AutoLinkApplyToEnum): AutoLinkApplyToEnum {
  if (!Object.values(AutoLinkApplyToEnum).includes(applyTo)) {
    throw new ValidationError('applyTo inválido');
  }
  return applyTo;
}

export function normalizeAutoLinkKeyword(keyword: string): string {
  return normalizeKeyword(keyword).toLowerCase();
}

export class AutoLink {
  private constructor(
    readonly id: AutoLinkId,
    readonly keyword: string,
    readonly targetUrl: string,
    readonly maxMatches: number,
    readonly priority: number,
    readonly isActive: boolean,
    readonly applyTo: AutoLinkApplyToEnum,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static create(props: {
    id: string;
    keyword: string;
    targetUrl: string;
    maxMatches?: number;
    priority?: number;
    isActive?: boolean;
    applyTo?: AutoLinkApplyToEnum;
    createdAt?: Date;
    updatedAt?: Date;
  }): AutoLink {
    const now = new Date();
    return new AutoLink(
      toAutoLinkId(props.id),
      validateKeyword(props.keyword),
      validateTargetUrl(props.targetUrl),
      validateMaxMatches(props.maxMatches ?? 1),
      props.priority ?? 0,
      props.isActive ?? true,
      validateApplyTo(props.applyTo ?? AutoLinkApplyToEnum.BOTH),
      props.createdAt ?? now,
      props.updatedAt ?? now,
    );
  }

  withUpdates(props: {
    keyword?: string;
    targetUrl?: string;
    maxMatches?: number;
    priority?: number;
    isActive?: boolean;
    applyTo?: AutoLinkApplyToEnum;
  }): AutoLink {
    return AutoLink.create({
      id: this.id,
      keyword: props.keyword ?? this.keyword,
      targetUrl: props.targetUrl ?? this.targetUrl,
      maxMatches: props.maxMatches ?? this.maxMatches,
      priority: props.priority ?? this.priority,
      isActive: props.isActive ?? this.isActive,
      applyTo: props.applyTo ?? this.applyTo,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }

  activate(): AutoLink {
    return this.withUpdates({ isActive: true });
  }

  deactivate(): AutoLink {
    return this.withUpdates({ isActive: false });
  }
}

export { AutoLinkApplyToEnum as AutoLinkApplyTo };
