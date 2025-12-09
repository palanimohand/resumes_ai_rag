import mongoose from 'mongoose';
import config from '../config';

let isConnected = false;

export async function connectMongo(): Promise<void> {
  if (isConnected) return;
  const uri = config.mongodbUri;
  if (!uri) throw new Error('MONGODB_URI is not configured');

  mongoose.connection.on('connected', () => {
    isConnected = true;
    console.info('MongoDB connected');
  });

  mongoose.connection.on('disconnected', () => {
    isConnected = false;
    console.warn('MongoDB disconnected');
  });

  mongoose.connection.on('error', (err) => {
    isConnected = false;
    console.error('MongoDB error', err);
  });

  const connectOptions: mongoose.ConnectOptions = {};
  // If a DB name is supplied in config, pass it explicitly so mongoose uses the right DB
  if (config.mongodbDbName) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - mongoose types accept dbName in options
    (connectOptions as any).dbName = config.mongodbDbName;
  }

  await mongoose.connect(uri, connectOptions);
}

export function getMongoStatus(): 'connected' | 'disconnected' {
  return isConnected ? 'connected' : 'disconnected';
}
