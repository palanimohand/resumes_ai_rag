import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import apiV1 from './routes/api.v1';

const createApp = () => {
  const app = express();
  app.use(morgan('dev'));
  app.use(cors());
  app.use(express.json());

  app.use('/api/v1', apiV1);

  app.get('/', (_req, res) => res.send('resumes-ai-rag service'));

  return app;
};

export default createApp;
