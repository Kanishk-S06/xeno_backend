import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import * as shopifyService from '../services/shopifyService';
const prisma = new PrismaClient();

export function startSyncJob() {
  cron.schedule('*/5 * * * *', async () => {
    console.log('[syncJob] starting periodic sync for tenants');
    try {
      const tenants = await prisma.tenant.findMany();
      for (const t of tenants) {
        try {
          if (t.apiKey) {
            await shopifyService.fetchAndPersist(t.id);
          } else {
            console.log(`[syncJob] tenant ${t.id} missing api token — skipping`);
          }
        } catch (err) {
          console.error(`[syncJob] error syncing tenant ${t.id}`, err);
        }
      }
    } catch (err) {
      console.error('[syncJob] unexpected error', err);
    }
  });
}
