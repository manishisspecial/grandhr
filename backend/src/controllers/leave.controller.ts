import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { z } from 'zod';

const prisma = new PrismaClient();

const applyLeaveSchema = z.object({
  type: z.enum(['SICK_LEAVE', 'CASUAL_LEAVE', 'EARNED_LEAVE', 'MATERNITY_LEAVE', 'PATERNITY_LEAVE', 'COMP_OFF', 'LOP']),
  startDate: z.string(),
  endDate: z.string(),
  reason: z.string().optional(),
});

const calculateDays = (startDate: Date, endDate: Date): number => {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
};

export const applyLeave = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const data = applyLeaveSchema.parse(req.body);

    // Get employee
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { employee: true },
    });

    if (!user || !user.employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (startDate > endDate) {
      return res.status(400).json({ message: 'Start date must be before end date' });
    }

    const days = calculateDays(startDate, endDate);

    const leave = await prisma.leave.create({
      data: {
        employeeId: user.employee.id,
        type: data.type,
        startDate,
        endDate,
        days,
        reason: data.reason,
      },
    });

    res.status(201).json({
      message: 'Leave applied successfully',
      leave,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ message: error.message || 'Failed to apply leave' });
  }
};

export const getLeaves = async (req: AuthRequest, res: Response) => {
  try {
    const { status, type, page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) where.status = status;
    if (type) where.type = type;

    const [leaves, total] = await Promise.all([
      prisma.leave.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeId: true,
              designation: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.leave.count({ where }),
    ]);

    res.json({
      leaves,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch leaves' });
  }
};

export const getEmployeeLeaves = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { employee: true },
    });

    if (!user || !user.employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const leaves = await prisma.leave.findMany({
      where: { employeeId: user.employee.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ leaves });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch leaves' });
  }
};

export const getLeaveById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const leave = await prisma.leave.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeId: true,
            designation: true,
          },
        },
      },
    });

    if (!leave) {
      return res.status(404).json({ message: 'Leave not found' });
    }

    res.json({ leave });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch leave' });
  }
};

export const updateLeaveStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, rejectedReason } = req.body;

    if (!['APPROVED', 'REJECTED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const updateData: any = {
      status,
      approvedBy: req.userId,
      approvedAt: new Date(),
    };

    if (status === 'REJECTED' && rejectedReason) {
      updateData.rejectedReason = rejectedReason;
    }

    const leave = await prisma.leave.update({
      where: { id },
      data: updateData,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeId: true,
          },
        },
      },
    });

    res.json({
      message: 'Leave status updated successfully',
      leave,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update leave status' });
  }
};

export const getLeaveBalance = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { employee: true },
    });

    if (!user || !user.employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Get approved leaves for current year
    const currentYear = new Date().getFullYear();
    const approvedLeaves = await prisma.leave.findMany({
      where: {
        employeeId: user.employee.id,
        status: 'APPROVED',
        startDate: {
          gte: new Date(`${currentYear}-01-01`),
          lte: new Date(`${currentYear}-12-31`),
        },
      },
    });

    const usedLeaves = approvedLeaves.reduce((sum, leave) => sum + leave.days, 0);

    // Default leave balances (can be configured per employee)
    const leaveBalances = {
      SICK_LEAVE: { total: 12, used: 0, remaining: 12 },
      CASUAL_LEAVE: { total: 12, used: 0, remaining: 12 },
      EARNED_LEAVE: { total: 15, used: 0, remaining: 15 },
      MATERNITY_LEAVE: { total: 26, used: 0, remaining: 26 },
      PATERNITY_LEAVE: { total: 5, used: 0, remaining: 5 },
      COMP_OFF: { total: 0, used: 0, remaining: 0 },
      LOP: { total: 0, used: 0, remaining: 0 },
    };

    // Calculate used leaves by type
    approvedLeaves.forEach((leave) => {
      if (leaveBalances[leave.type as keyof typeof leaveBalances]) {
        leaveBalances[leave.type as keyof typeof leaveBalances].used += leave.days;
        leaveBalances[leave.type as keyof typeof leaveBalances].remaining -= leave.days;
      }
    });

    res.json({
      year: currentYear,
      totalUsed: usedLeaves,
      balances: leaveBalances,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch leave balance' });
  }
};

