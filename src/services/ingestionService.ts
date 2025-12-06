import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function handleShopifyEvent(tenantId: string | undefined, event: string, payload: any) {
  if (!tenantId) {
    console.warn('Event received without tenantId — ignoring. topic:', event);
    return;
  }

  if (event.includes('orders')) {
    const extId = payload.id.toString();
    const amount = parseFloat(payload.total_price || 0);
    await prisma.order.upsert({
      where: { externalId_tenantId: { externalId: extId, tenantId } as any },
      update: { amount, status: payload.financial_status, createdAt: new Date(payload.created_at) } as any,
      create: { tenantId, externalId: extId, amount, status: payload.financial_status, createdAt: new Date(payload.created_at) } as any
    });
    if (payload.customer) {
      const externalCustomerId = payload.customer.id.toString();
      await prisma.customer.upsert({
        where: { externalId_tenantId: { externalId: externalCustomerId, tenantId } as any },
        update: { totalSpent: { increment: amount } as any },
        create: { tenantId, externalId: externalCustomerId, email: payload.customer.email, name: `${payload.customer.first_name || ''} ${payload.customer.last_name || ''}`, totalSpent: amount } as any
      });
    }
  } else if (event.includes('customers')) {
    const c = payload;
    const extId = c.id.toString();
    await prisma.customer.upsert({
      where: { externalId_tenantId: { externalId: extId, tenantId } as any },
      update: { email: c.email, name: `${c.first_name || ''} ${c.last_name || ''}` } as any,
      create: { tenantId, externalId: extId, email: c.email, name: `${c.first_name || ''} ${c.last_name || ''}` } as any
    });
  } else if (event.includes('products')) {
    const p = payload;
    const extId = p.id.toString();
    await prisma.product.upsert({
      where: { externalId_tenantId: { externalId: extId, tenantId } as any },
      update: { title: p.title, price: parseFloat(p.variants?.[0]?.price || 0) } as any,
      create: { tenantId, externalId: extId, title: p.title, price: parseFloat(p.variants?.[0]?.price || 0) } as any
    });
  } else {
    console.log('Unhandled Shopify event:', event);
  }
}
