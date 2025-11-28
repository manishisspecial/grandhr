import express from 'express';
import {
  createPayroll,
  getPayrolls,
  getPayrollById,
  getMyPayrolls,
  updatePayroll,
  generatePayroll,
} from '../controllers/payroll.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/', authenticate, authorize('ADMIN', 'HR'), createPayroll);
router.post('/generate', authenticate, authorize('ADMIN', 'HR'), generatePayroll);
router.get('/', authenticate, authorize('ADMIN', 'HR'), getPayrolls);
router.get('/my-payrolls', authenticate, getMyPayrolls);
router.get('/:id', authenticate, getPayrollById);
router.put('/:id', authenticate, authorize('ADMIN', 'HR'), updatePayroll);

export default router;

