import express from 'express';
import {
  clockIn,
  clockOut,
  getAttendance,
  getMyAttendance,
  getAttendanceByDate,
  updateAttendance,
} from '../controllers/attendance.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/clock-in', authenticate, clockIn);
router.post('/clock-out', authenticate, clockOut);
router.get('/my-attendance', authenticate, getMyAttendance);
router.get('/employee/:employeeId', authenticate, authorize('ADMIN', 'HR', 'MANAGER'), getAttendance);
router.get('/date/:date', authenticate, getAttendanceByDate);
router.put('/:id', authenticate, authorize('ADMIN', 'HR'), updateAttendance);

export default router;

