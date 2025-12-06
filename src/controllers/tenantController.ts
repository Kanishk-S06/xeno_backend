import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function createTenant(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, storefront, apiKey, apiSecret } = req.body;
    if (!name) return res.status(400).json({ message: 'name required' });
    const tenant = await prisma.tenant.create({ data: { name, storefront, apiKey, apiSecret } });
    res.json(tenant);
  } catch (err) {
    next(err);
  }
}

export async function listTenants(req: Request, res: Response, next: NextFunction) {
  try {
    const tenants = await prisma.tenant.findMany();
    res.json(tenants);
  } catch (err) {
    next(err);
  }
}
export const getTenantById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenant = await prisma.tenant.findUnique({ where: { id } });

    if (!tenant) return res.status(404).json({ message: "Tenant not found" });

    return res.json(tenant);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
export const deleteTenantById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.tenant.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    await prisma.tenant.delete({
      where: { id }
    });

    return res.json({ message: "Tenant deleted successfully" });

  } catch (err) {
    console.error("Error deleting tenant:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

