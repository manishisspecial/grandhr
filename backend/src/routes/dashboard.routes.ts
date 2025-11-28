import express from 'express';
import {
  getAdminDashboard,
  getEmployeeDashboard,
} from '../controllers/dashboard.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/admin', authenticate, authorize('ADMIN', 'HR'), getAdminDashboard);
router.get('/employee', authenticate, getEmployeeDashboard);

export default router;

