import createApp from './app';
import config from './config';
import { connectMongo } from './db/mongo';

const app = createApp();

async function start() {
  try {
    await connectMongo();
  } catch (err) {
    console.error('Failed to connect to MongoDB on startup', err);
  }

  const port = config.port;
  app.listen(port, () => {
    console.info(`Server listening on port ${port} (env=${config.env})`);
  });
}

start().catch((err) => {
  console.error('Fatal error during startup', err);
  process.exit(1);
});
