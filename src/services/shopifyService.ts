import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';

const prisma = new PrismaClient();

// --- Add this ---
interface ShopifyOrderResponse {
  orders: Array<{
    id: number;
    created_at: string;
    total_price: string;
    financial_status: string;
    customer?: {
      id: number;
      email: string;
      first_name: string | null;
      last_name: string | null;
    };
  }>;
}
// ----------------

export async function fetchAndPersist(tenantId: string) {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });

  if (!tenant) throw new Error("Tenant not found");
  if (!tenant.storefront) throw new Error("Storefront missing");

  const token = tenant.apiKey;
  if (!token) throw new Error("No API key found");

  const base = `https://${tenant.storefront}/admin/api/2024-10`;


  const ordersResp = await fetch(`${base}/orders.json?limit=50`, {
    headers: { 'X-Shopify-Access-Token': token },
  });

  const ordersJson = (await ordersResp.json()) as ShopifyOrderResponse;

  if (ordersJson.orders) {
    for (const o of ordersJson.orders) {
      const extId = o.id.toString();
      const amount = parseFloat(o.total_price || '0');

      await prisma.order.upsert({
        where: { externalId_tenantId: { externalId: extId, tenantId } },
        update: {
          amount,
          status: o.financial_status,
          createdAt: new Date(o.created_at),
        },
        create: {
          tenantId,
          externalId: extId,
          amount,
          status: o.financial_status,
          createdAt: new Date(o.created_at),
        },
      });

      if (o.customer) {
        const custExt = o.customer.id.toString();

        await prisma.customer.upsert({
          where: { externalId_tenantId: { externalId: custExt, tenantId } },
          update: {
            totalSpent: { increment: amount },
          },
          create: {
            tenantId,
            externalId: custExt,
            email: o.customer.email,
            name: `${o.customer.first_name || ''} ${o.customer.last_name || ''}`,
            totalSpent: amount,
          },
        });
      }
    }
  }
}
