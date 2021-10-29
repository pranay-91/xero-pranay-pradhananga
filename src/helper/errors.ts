/**
 * Validation Error thrown when there is an error in validation
 * @param {string} message - Error message detailing why validation failed
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super();
    // need this for `instanceof` checks to work see:
    // https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work
    Object.setPrototypeOf(this, ValidationError.prototype);
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super();
    // need this for `instanceof` checks to work see:
    // https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work
    Object.setPrototypeOf(this, NotFoundError.prototype);
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super();
    // need this for `instanceof` checks to work see:
    // https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work
    Object.setPrototypeOf(this, ConflictError.prototype);
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
  }
}

export class UnprocessableEntityError extends Error {
  constructor(message: string) {
    super();
    // need this for `instanceof` checks to work see:
    // https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work
    Object.setPrototypeOf(this, UnprocessableEntityError.prototype);
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
  }
}

export default {
  ValidationError,
  NotFoundError,
  ConflictError,
  UnprocessableEntityError,
};
