import config from '@/config';
import { createLogger, format, transports } from 'winston';

// creates a logger with meta data such as service name, timestamp.
const logger = createLogger({
  level: config.app.logLevel,
  format: format.combine(format.timestamp(), format.json()),
  defaultMeta: { service: 'product-service' },
  transports: [new transports.Console({ stderrLevels: ['error'], level: config.app.logLevel })],
  exitOnError: false,
});

export default logger;
