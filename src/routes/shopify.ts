import { Router } from 'express';
import express from 'express';
import { shopifyWebhook, pollShopify } from '../controllers/shopifyController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.post('/webhook', express.raw({ type: 'application/json' }), shopifyWebhook);
router.post('/poll',authMiddleware, pollShopify);

export default router;
