import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyShopifyWebhook } from '../utils/shopifyUtils';
import { handleShopifyEvent } from '../services/ingestionService';
import * as shopifyService from '../services/shopifyService';
import { fetchAndPersist } from "../services/shopifyService";
const prisma = new PrismaClient();

export async function shopifyWebhook(req: Request, res: Response, next: NextFunction) {
  try {
    const rawBody = (req as any).body as Buffer;
    const hmac = req.header('x-shopify-hmac-sha256') || '';
    const shopDomain = req.header('x-shopify-shop-domain') || undefined;
    let tenant = null;
    if (shopDomain) {
      tenant = await prisma.tenant.findFirst({ where: { storefront: shopDomain } });
    }
    const secret = tenant?.apiSecret || process.env.SHOPIFY_API_SECRET;
    const ok = await verifyShopifyWebhook(rawBody, hmac, secret || '');
    if (!ok) {
      return res.status(401).send('invalid webhook signature');
    }
    const topic = req.header('x-shopify-topic') || 'unknown';
    const payload = JSON.parse(rawBody.toString('utf8'));
    const tenantId = tenant ? tenant.id : undefined;
    await handleShopifyEvent(tenantId, topic, payload);
    res.status(200).send('ok');
  } catch (err) {
    next(err);
  }
}

export async function pollShopify(req: Request, res: Response) {
  try {
    const { tenantId } = req.body;

    if (!tenantId) {
      return res.status(400).json({ message: "tenantId missing" });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    if (!tenant.storefront) {
      return res.status(400).json({ message: "Storefront missing" });
    }

    if (!tenant.apiKey) {
      return res.status(400).json({ message: "API Key missing" });
    }

    // 🔥 Everything valid → Perform Shopify sync
    await fetchAndPersist(tenantId);

    return res.json({ message: "Synced successfully" });
  } catch (error) {
    console.error("❌ Shopify Sync Error:", error);
    return res.status(500).json({ message: "Shopify sync failed" });
  }
}
