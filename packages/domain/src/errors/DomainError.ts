export class DomainError extends Error {
  constructor(
    message: string,
    readonly code: string,
  ) {
    super(message);
    this.name = 'DomainError';
  }
}

export class MarketplaceRateLimitError extends DomainError {
  constructor(marketplace: string) {
    super(`Rate limit exceeded for marketplace: ${marketplace}`, 'MARKETPLACE_RATE_LIMIT');
    this.name = 'MarketplaceRateLimitError';
  }
}

export class UnsupportedMarketplaceError extends DomainError {
  constructor(marketplace: string) {
    super(`Unsupported marketplace: ${marketplace}`, 'UNSUPPORTED_MARKETPLACE');
    this.name = 'UnsupportedMarketplaceError';
  }
}

export class EntityNotFoundError extends DomainError {
  constructor(entity: string, id: string) {
    super(`${entity} not found: ${id}`, 'ENTITY_NOT_FOUND');
    this.name = 'EntityNotFoundError';
  }
}

export class ValidationError extends DomainError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class ConflictError extends DomainError {
  constructor(message: string) {
    super(message, 'CONFLICT');
    this.name = 'ConflictError';
  }
}

export class AuthenticationError extends DomainError {
  constructor(message = 'E-mail ou senha inválidos') {
    super(message, 'AUTHENTICATION_FAILED');
    this.name = 'AuthenticationError';
  }
}
