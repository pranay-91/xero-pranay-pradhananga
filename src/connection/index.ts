import mongoose from 'mongoose';
import config from '../config';
// creates a mongo db connection provided by a connection string in config
export const dbConnection = mongoose.createConnection(config.db.connectionString);
