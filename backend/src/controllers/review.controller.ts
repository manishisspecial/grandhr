import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { z } from 'zod';

const prisma = new PrismaClient();

const createReviewSchema = z.object({
  employeeId: z.string(),
  period: z.string(),
  rating: z.number().min(1).max(5).optional(),
  feedback: z.string().optional(),
  goals: z.string().optional(),
  achievements: z.string().optional(),
});

export const createReview = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const data = createReviewSchema.parse(req.body);

    // Get reviewer's employee record
    const reviewer = await prisma.user.findUnique({
      where: { id: userId },
      include: { employee: true },
    });

    if (!reviewer || !reviewer.employee) {
      return res.status(404).json({ message: 'Reviewer not found' });
    }

    const review = await prisma.performanceReview.create({
      data: {
        employeeId: data.employeeId,
        reviewerId: reviewer.employee.id,
        period: data.period,
        rating: data.rating,
        feedback: data.feedback,
        goals: data.goals,
        achievements: data.achievements,
      },
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
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeId: true,
          },
        },
      },
    });

    res.status(201).json({
      message: 'Performance review created successfully',
      review,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ message: error.message || 'Failed to create review' });
  }
};

export const getReviews = async (req: AuthRequest, res: Response) => {
  try {
    const { employeeId, reviewerId, period, status, page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (employeeId) where.employeeId = employeeId;
    if (reviewerId) where.reviewerId = reviewerId;
    if (period) where.period = period;
    if (status) where.status = status;

    const [reviews, total] = await Promise.all([
      prisma.performanceReview.findMany({
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
          reviewer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeId: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.performanceReview.count({ where }),
    ]);

    res.json({
      reviews,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch reviews' });
  }
};

export const getMyReviews = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { employee: true },
    });

    if (!user || !user.employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const reviews = await prisma.performanceReview.findMany({
      where: { employeeId: user.employee.id },
      include: {
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeId: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ reviews });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch reviews' });
  }
};

export const getReviewById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const review = await prisma.performanceReview.findUnique({
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
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeId: true,
          },
        },
      },
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json({ review });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch review' });
  }
};

export const updateReview = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;
    const updateData = req.body;

    const review = await prisma.performanceReview.findUnique({
      where: { id },
      include: { reviewer: { include: { user: true } } },
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user is the reviewer or admin/hr
    if (review.reviewer.userId !== userId && req.userRole !== 'ADMIN' && req.userRole !== 'HR') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedReview = await prisma.performanceReview.update({
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
        reviewer: {
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
      message: 'Review updated successfully',
      review: updatedReview,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update review' });
  }
};

