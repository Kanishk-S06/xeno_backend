import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../config';

const prisma = new PrismaClient();

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, tenantId } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'email and password required' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashed, tenantId }
    });
    res.json({ id: user.id, email: user.email });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'email and password required' });
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: 'invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'invalid credentials' });
    const token = jwt.sign({ userId: user.id, tenantId: user.tenantId, email: user.email }, config.JWT_SECRET as string, { expiresIn: '7d' });
    res.json({ token });
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request & any, res: Response) {
  res.json({ user: req.user });
}
