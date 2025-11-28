import express from 'express';
import {
  applyLeave,
  getLeaves,
  getLeaveById,
  updateLeaveStatus,
  getEmployeeLeaves,
  getLeaveBalance,
} from '../controllers/leave.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/', authenticate, applyLeave);
router.get('/', authenticate, getLeaves);
router.get('/my-leaves', authenticate, getEmployeeLeaves);
router.get('/balance', authenticate, getLeaveBalance);
router.get('/:id', authenticate, getLeaveById);
router.put('/:id/status', authenticate, authorize('ADMIN', 'HR', 'MANAGER'), updateLeaveStatus);

export default router;

