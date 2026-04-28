import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { requireAuth } from '../middleware/auth'

const router = Router()

const createReviewSchema = z.object({
  listingId: z.number().int().positive(),
  reviewedId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  body: z.string().min(10),
})

const reviewerSelect = { id: true, username: true, photoUrl: true }

// GET /api/users/:userId/reviews
router.get('/users/:userId/reviews', async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId as string)
  if (isNaN(userId)) {
    res.status(400).json({ error: 'Invalid user ID' })
    return
  }

  const reviews = await prisma.review.findMany({
    where: { reviewedId: userId },
    include: { reviewer: { select: reviewerSelect } },
    orderBy: { createdAt: 'desc' },
  })

  res.status(200).json({ reviews })
})

// GET /api/reviews/:id
router.get('/reviews/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string)
  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid review ID' })
    return
  }

  const review = await prisma.review.findUnique({
    where: { id },
    include: { reviewer: { select: reviewerSelect } },
  })

  if (!review) {
    res.status(404).json({ error: 'Review not found' })
    return
  }

  res.status(200).json({ review })
})

// POST /api/reviews
router.post('/reviews', requireAuth, async (req: Request, res: Response) => {
  const result = createReviewSchema.safeParse(req.body)
  if (!result.success) {
    res.status(400).json({ error: result.error.issues })
    return
  }

  const { listingId, reviewedId, rating, body } = result.data
  const reviewerId = req.user!.userId

  if (reviewerId === reviewedId) {
    res.status(400).json({ error: 'You cannot review yourself' })
    return
  }

  try {
    const review = await prisma.review.create({
      data: { listingId, reviewerId, reviewedId, rating, body },
    })
    res.status(201).json({ review })
  } catch (err: any) {
    if (err.code === 'P2002') {
      res.status(409).json({ error: 'You have already reviewed this listing' })
      return
    }
    throw err
  }
})

export default router
