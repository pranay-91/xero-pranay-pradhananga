import express, { Application, Request, Response, NextFunction } from 'express';
import routes from './routes';
import { ValidationError, NotFoundError, ConflictError } from '@/helper/errors';
import HttpStatus from 'http-status-codes';
import helmet from 'helmet';
import morgan from 'morgan';
import logger from '@/lib/logger';
import { addContext } from '@/middlewares/request';

const app: Application = express();

// Add logger info passed as locals within express
app.locals.logger = logger;

// add request specific logger and context
app.use(addContext);

// add morgan for request / response logging
app.use((req, res, next) => {
  morgan('tiny', { stream: { write: (message): void => res.locals.logger.info(message) } })(req, res, next);
});

// add basic security features such xss filter, csp;
app.use(helmet());

// parse/serialise responses to json objects
app.use(express.json());

// adding routes
app.use('/', routes);

// middleware to handle various errors and log as necessary
app.use('/', (err: Error, req: Request, res: Response, next: NextFunction) => {
  // default to 500 internal server error unless we've defined a specific error
  let code = 500;
  if (err instanceof ValidationError) {
    code = HttpStatus.BAD_REQUEST;
  }
  if (err instanceof NotFoundError) {
    code = HttpStatus.NOT_FOUND;
  }
  if (err instanceof ConflictError) {
    code = HttpStatus.CONFLICT;
  }
  const l = res.locals.logger || logger;
  if (code >= 500) {
    // log internal errors as errors so they're easier to find in the logs
    l.error(err.message);
  } else {
    // anything in the 400 range means the it's the consumer's fault so not critical
    l.info(err.message);
  }
  res.status(code).json({
    message: err.message,
  });
});

export default app;
