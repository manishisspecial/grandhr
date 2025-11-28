import express from 'express';
import {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeesByDepartment,
} from '../controllers/employee.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', authenticate, getAllEmployees);
router.get('/department/:department', authenticate, getEmployeesByDepartment);
router.get('/:id', authenticate, getEmployeeById);
router.post('/', authenticate, authorize('ADMIN', 'HR'), createEmployee);
router.put('/:id', authenticate, authorize('ADMIN', 'HR'), updateEmployee);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteEmployee);

export default router;

