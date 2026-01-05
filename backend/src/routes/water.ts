import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Create water entry
router.post('/', async (req: Request, res: Response) => {
  try {
    const { timestamp, amountMl, type, source } = req.body;

    if (!timestamp || !amountMl) {
      return res.status(400).json({
        error: 'Missing required fields: timestamp, amountMl'
      });
    }

    // Check for duplicate (idempotent insert)
    const existing = await prisma.water.findFirst({
      where: {
        timestamp: new Date(timestamp),
        amountMl,
        type: type || 'water',
        source: source || 'manual'
      }
    });

    if (existing) {
      return res.status(200).json(existing);
    }

    const entry = await prisma.water.create({
      data: {
        timestamp: new Date(timestamp),
        amountMl,
        type: type || 'water',
        source: source || 'manual'
      }
    });

    res.status(201).json(entry);
  } catch (error) {
    console.error('Error creating water entry:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get water entries
router.get('/', async (req: Request, res: Response) => {
  try {
    const { limit = '100', offset = '0', startDate, endDate } = req.query;

    const where: any = {};

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate as string);
      if (endDate) where.timestamp.lte = new Date(endDate as string);
    }

    const entries = await prisma.water.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    res.json(entries);
  } catch (error) {
    console.error('Error fetching water entries:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
