import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const MONGODB_URI = process.env.MONGODB_URI || '';
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || '';
const NODE_ENV = process.env.NODE_ENV || 'development';

if (!MONGODB_URI) {
  console.warn('MONGODB_URI is not set — application will fail to connect until configured.');
}

export default {
  port: PORT,
  mongodbUri: MONGODB_URI,
  mongodbDbName: MONGODB_DB_NAME,
  env: NODE_ENV
};
