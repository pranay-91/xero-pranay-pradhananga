export default {
  app: {
    port: parseInt(process.env.PORT ?? '8080'),
    hostname: process.env.HOSTNAME || 'localhost',
    logLevel: process.env.LOG_LEVEL || 'info',
  },
  db: {
    connectionString: process.env.DB_CONNECTION_STRING ?? 'mongodb://localhost:27017/productShop',
  },
};
