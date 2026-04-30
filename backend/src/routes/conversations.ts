import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { requireAuth } from '../middleware/auth'

const router = Router()

const createConversationSchema = z.object({
  listingId: z.number().int().positive(),
})

const participantSelect = { id: true, username: true, photoUrl: true }

// GET /api/conversations
router.get('/', requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.userId

  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ buyerId: userId }, { sellerId: userId }],
    },
    include: {
      listing: { select: { id: true, title: true, status: true } },
      buyer: { select: participantSelect },
      seller: { select: participantSelect },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      _count: {
        select: {
          messages: {
            where: { isRead: false, senderId: { not: userId } },
          },
        },
      },
    },
    orderBy: { lastMessageAt: 'desc' },
  })

  res.status(200).json({ conversations })
})

// GET /api/conversations/:id
router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string)
  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid conversation ID' })
    return
  }

  const userId = req.user!.userId

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      listing: { select: { id: true, title: true, status: true } },
      buyer: { select: participantSelect },
      seller: { select: participantSelect },
    },
  })

  if (!conversation) {
    res.status(404).json({ error: 'Conversation not found' })
    return
  }

  if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
    res.status(403).json({ error: 'Forbidden' })
    return
  }

  res.status(200).json({ conversation })
})

// POST /api/conversations
router.post('/', requireAuth, async (req: Request, res: Response) => {
  const result = createConversationSchema.safeParse(req.body)
  if (!result.success) {
    res.status(400).json({ error: result.error.issues })
    return
  }

  const buyerId = req.user!.userId
  const { listingId } = result.data

  const listing = await prisma.listing.findUnique({ where: { id: listingId } })
  if (!listing) {
    res.status(404).json({ error: 'Listing not found' })
    return
  }

  if (listing.userId === buyerId) {
    res.status(400).json({ error: 'You cannot message yourself about your own listing' })
    return
  }

  const sellerId = listing.userId

  const conversation = await prisma.conversation.upsert({
    where: { listingId_buyerId: { listingId, buyerId } },
    update: {},
    create: { listingId, buyerId, sellerId },
    include: {
      listing: { select: { id: true, title: true, status: true } },
      buyer: { select: participantSelect },
      seller: { select: participantSelect },
    },
  })

  res.status(200).json({ conversation })
})

export default router
