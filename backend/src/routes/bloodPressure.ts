import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Create blood pressure reading
router.post('/', async (req: Request, res: Response) => {
  try {
    const { timestamp, systolic, diastolic, pulse, note, source } = req.body;

    if (!timestamp || !systolic || !diastolic) {
      return res.status(400).json({
        error: 'Missing required fields: timestamp, systolic, diastolic'
      });
    }

    // Check for duplicate (idempotent insert)
    const existing = await prisma.bloodPressure.findFirst({
      where: {
        timestamp: new Date(timestamp),
        systolic,
        diastolic,
        source: source || 'manual'
      }
    });

    if (existing) {
      return res.status(200).json(existing);
    }

    const reading = await prisma.bloodPressure.create({
      data: {
        timestamp: new Date(timestamp),
        systolic,
        diastolic,
        pulse: pulse || null,
        note: note || null,
        source: source || 'manual'
      }
    });

    res.status(201).json(reading);
  } catch (error) {
    console.error('Error creating blood pressure reading:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get blood pressure readings
router.get('/', async (req: Request, res: Response) => {
  try {
    const { limit = '100', offset = '0' } = req.query;

    const readings = await prisma.bloodPressure.findMany({
      orderBy: { timestamp: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    res.json(readings);
  } catch (error) {
    console.error('Error fetching blood pressure readings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
