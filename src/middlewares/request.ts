import { RequestHandler, Response, Request, NextFunction, Application } from 'express';
import { Schema, ValidationOptions } from '@hapi/joi';
import { ValidationError } from '@/helper/errors';
import logger from '@/lib/logger';
import { v4 as uuidv4 } from 'uuid';
/**
 * validate req.body against a joi schema. Mutates req.body with the result of the
 * validation to pick up default values
 */
export const validateBody = (schema: Schema, options: ValidationOptions = {}): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const schemaResult = schema.validate(req.body, options);
    if (schemaResult.error) {
      next(new ValidationError(schemaResult.error.details[0].message));
      return;
    }
    req.body = schemaResult.value;
    next();
  };
};

/**
 * Validate req.params against a joi schema. Mutates req.params with the result of the
 * validation to pick up default values.
 */
export const validateParams = (schema: Schema, options: ValidationOptions = {}): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const schemaResult = schema.validate(req.params, options);
    if (schemaResult.error) {
      next(new ValidationError(schemaResult.error.details[0].message));
      return;
    }
    req.params = schemaResult.value;
    next();
  };
};

/**
 * Validate req.query against a joi schema. Mutates req.query with the results of the
 * validation to pick up default value.
 */
export const validateQuery = (schema: Schema, options: ValidationOptions = {}): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const schemaResult = schema.validate(req.query, options);
    if (schemaResult.error) {
      next(new ValidationError(schemaResult.error.details[0].message));
      return;
    }
    req.query = schemaResult.value;
    next();
  };
};

/**
 * Parse incoming request add context to res.locals
 * Populates: res.locals.correlationId, res.locals.logger
 */
export const addContext = (req: Request, res: Response, next: NextFunction): void => {
  const correlationId = req.get('x-correlation-id') ?? uuidv4();
  // save this in case we need to propagate it to other services
  res.locals.correlationId = correlationId;
  const app = req.app as Application;
  const l = app.locals.logger ?? logger;
  res.locals.logger = l.child({
    correlationId,
  });
  next();
};

export default {
  addContext,
  validateBody,
  validateParams,
  validateQuery,
};
