import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { requireAuth } from '../middleware/auth'
import { getIO } from '../lib/socket'

const router = Router({ mergeParams: true })

const messageSchema = z.object({
  body: z.string().min(1),
})

async function getConversationAsParticipant(conversationId: number, userId: number, res: Response) {
  const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } })
  if (!conversation) {
    res.status(404).json({ error: 'Conversation not found' })
    return null
  }
  if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
    res.status(403).json({ error: 'Forbidden' })
    return null
  }
  return conversation
}

// GET /api/conversations/:conversationId/messages
router.get('/', requireAuth, async (req: Request, res: Response) => {
  const conversationId = parseInt(req.params.conversationId as string)
  if (isNaN(conversationId)) {
    res.status(400).json({ error: 'Invalid conversation ID' })
    return
  }

  const conversation = await getConversationAsParticipant(conversationId, req.user!.userId, res)
  if (!conversation) return

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
  })

  res.status(200).json({ messages })
})

// POST /api/conversations/:conversationId/messages
router.post('/', requireAuth, async (req: Request, res: Response) => {
  const conversationId = parseInt(req.params.conversationId as string)
  if (isNaN(conversationId)) {
    res.status(400).json({ error: 'Invalid conversation ID' })
    return
  }

  const conversation = await getConversationAsParticipant(conversationId, req.user!.userId, res)
  if (!conversation) return

  const result = messageSchema.safeParse(req.body)
  if (!result.success) {
    res.status(400).json({ error: result.error.issues })
    return
  }

  const senderId = req.user!.userId

  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: { conversationId, senderId, body: result.data.body },
    }),
    prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    }),
    prisma.message.updateMany({
      where: { conversationId, senderId: { not: senderId }, isRead: false },
      data: { isRead: true },
    }),
  ])

  // Broadcast the new message to everyone in the conversation room
  const io = getIO()
  io.to(`conversation:${conversationId}`).emit('new_message', message)

  // Notify both participants so their MessagesPage unread counts refresh
  io.to(`user:${conversation.buyerId}`).emit('conversations_updated')
  io.to(`user:${conversation.sellerId}`).emit('conversations_updated')

  res.status(201).json({ message })
})

// PATCH /api/conversations/:conversationId/read
router.patch('/read', requireAuth, async (req: Request, res: Response) => {
  const conversationId = parseInt(req.params.conversationId as string)
  if (isNaN(conversationId)) {
    res.status(400).json({ error: 'Invalid conversation ID' })
    return
  }

  const conversation = await getConversationAsParticipant(conversationId, req.user!.userId, res)
  if (!conversation) return

  await prisma.message.updateMany({
    where: { conversationId, senderId: { not: req.user!.userId }, isRead: false },
    data: { isRead: true },
  })

  res.status(200).json({ message: 'Messages marked as read' })
})

export default router
