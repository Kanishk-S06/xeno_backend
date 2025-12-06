import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';

export function authMiddleware(req: Request & any, res: Response, next: NextFunction) {
  try {
    const auth = req.header('authorization') || '';
    const token = auth.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'no token' });
    const payload = jwt.verify(token, config.JWT_SECRET as string) as any;
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'invalid token', error: (err as Error).message });
  }
}
