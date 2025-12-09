import { Request, Response } from 'express';
import { getMongoStatus } from '../db/mongo';

export function healthHandler(_req: Request, res: Response) {
  const uptime = process.uptime();
  const db = getMongoStatus();

  res.status(200).json({
    status: 'ok',
    uptime_seconds: Math.floor(uptime),
    db
  });
}
