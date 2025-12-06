import { Router } from 'express';
import { createTenant, listTenants, getTenantById,deleteTenantById} from '../controllers/tenantController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.post('/', authMiddleware, createTenant);
router.get('/', listTenants);
router.get("/:id", authMiddleware,getTenantById);
router.delete("/:id",authMiddleware,deleteTenantById);
export default router;
