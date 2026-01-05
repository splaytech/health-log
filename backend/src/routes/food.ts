import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Create food entry
router.post('/', async (req: Request, res: Response) => {
  try {
    const { timestamp, description, calories, source } = req.body;

    if (!timestamp || !description) {
      return res.status(400).json({
        error: 'Missing required fields: timestamp, description'
      });
    }

    // Check for duplicate (idempotent insert)
    const existing = await prisma.food.findFirst({
      where: {
        timestamp: new Date(timestamp),
        description,
        source: source || 'manual'
      }
    });

    if (existing) {
      return res.status(200).json(existing);
    }

    const entry = await prisma.food.create({
      data: {
        timestamp: new Date(timestamp),
        description,
        calories: calories || null,
        source: source || 'manual'
      }
    });

    res.status(201).json(entry);
  } catch (error) {
    console.error('Error creating food entry:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get food entries
router.get('/', async (req: Request, res: Response) => {
  try {
    const { limit = '100', offset = '0' } = req.query;

    const entries = await prisma.food.findMany({
      orderBy: { timestamp: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    res.json(entries);
  } catch (error) {
    console.error('Error fetching food entries:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
