import './aliases';
import app from './app';
import config from './config';
import { dbConnection } from './connection';
import logger from '@/lib/logger';

/**
 * Create async connections and start up application
 */
const start = async (): Promise<void> => {
  const l = app.locals.logger ?? logger;
  try {
    const server = app.listen(config.app.port, () => {
      // eslint-disable-next-line no-console
      l.info(`Application listening on: ${config.app.port}`);
    });
    process.on('SIGTERM', () => {
      l.info('SIGTERM signal received.');
      l.info('Shutting down http server.');
      // NOTE: this will hang indefinitely already open sockets don't close
      // look at http-graceful-shutdown or similar if we want to hard close sockets
      // after a timeout
      server.close(async () => {
        await dbConnection.close();
        l.info('Database connections closed');
        process.exit(0);
      });
    });
  } catch (e: any) {
    l.error(`Application failed to start: ${e.message}}`);
    process.exit(1);
  }
};

start();
