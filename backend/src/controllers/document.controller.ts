import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { z } from 'zod';

const prisma = new PrismaClient();

const uploadDocumentSchema = z.object({
  name: z.string().min(1),
  type: z.string(),
  fileUrl: z.string().url(),
  employeeId: z.string().optional(),
});

export const uploadDocument = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const userRole = req.userRole!;
    const data = uploadDocumentSchema.parse(req.body);

    // If employeeId is provided, check if user has permission (admin/hr or own)
    let employeeId = data.employeeId;

    if (!employeeId) {
      // Use current user's employee ID
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { employee: true },
      });

      if (!user || !user.employee) {
        return res.status(404).json({ message: 'Employee not found' });
      }

      employeeId = user.employee.id;
    } else {
      // Check permission if uploading for another employee
      if (userRole !== 'ADMIN' && userRole !== 'HR') {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          include: { employee: true },
        });

        if (!user || user.employee?.id !== employeeId) {
          return res.status(403).json({ message: 'Access denied' });
        }
      }
    }

    const document = await prisma.document.create({
      data: {
        employeeId,
        name: data.name,
        type: data.type,
        fileUrl: data.fileUrl,
        uploadedBy: userId,
      },
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

    res.status(201).json({
      message: 'Document uploaded successfully',
      document,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ message: error.message || 'Failed to upload document' });
  }
};

export const getDocuments = async (req: AuthRequest, res: Response) => {
  try {
    const { employeeId, type, page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (employeeId) where.employeeId = employeeId;
    if (type) where.type = type;

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
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
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.document.count({ where }),
    ]);

    res.json({
      documents,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch documents' });
  }
};

export const getMyDocuments = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { employee: true },
    });

    if (!user || !user.employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const documents = await prisma.document.findMany({
      where: { employeeId: user.employee.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ documents });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch documents' });
  }
};

export const deleteDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;
    const userRole = req.userRole!;

    const document = await prisma.document.findUnique({
      where: { id },
      include: { employee: true },
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check permission
    if (userRole !== 'ADMIN' && userRole !== 'HR') {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { employee: true },
      });

      if (!user || user.employee?.id !== document.employeeId) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    await prisma.document.delete({
      where: { id },
    });

    res.json({ message: 'Document deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to delete document' });
  }
};

