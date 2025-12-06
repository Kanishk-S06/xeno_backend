import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import dayjs from 'dayjs';

const prisma = new PrismaClient();

export async function getSummary(req: Request & any, res: Response, next: NextFunction) {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(400).json({ message: 'tenant context missing' });

    const from = req.query.from ? dayjs(req.query.from as string).toDate() : dayjs().subtract(30, 'day').toDate();
    const to = req.query.to ? dayjs(req.query.to as string).toDate() : new Date();

    const totalCustomers = await prisma.customer.count({ where: { tenantId } });
    const totalOrders = await prisma.order.count({ where: { tenantId } });
    const totalRevenueAgg = await prisma.order.aggregate({ _sum: { amount: true }, where: { tenantId } });
    const totalRevenue = totalRevenueAgg._sum.amount || 0;

    const ordersByDate = await prisma.$queryRaw`
      SELECT DATE("createdAt") as date, SUM(amount) as revenue, COUNT(*) as orders
      FROM "Order"
      WHERE "tenantId" = ${tenantId} AND "createdAt" BETWEEN ${from} AND ${to}
      GROUP BY DATE("createdAt")
      ORDER BY date;
    `;

    const topCustomers = await prisma.customer.findMany({
      where: { tenantId },
      orderBy: { totalSpent: 'desc' },
      take: 5
    });

    res.json({
      totalCustomers,
      totalOrders,
      totalRevenue,
      ordersByDate,
      topCustomers
    });
  } catch (err) {
    next(err);
  }
}
