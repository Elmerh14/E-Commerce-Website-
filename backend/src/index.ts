import 'dotenv/config'
import { createServer } from 'http'
import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'

import { verifyAccessToken } from './lib/jwt'
import { initSocket } from './lib/socket'
import { prisma } from './lib/prisma'

import authRouter from './routes/auth'
import usersRouter from './routes/users'
import listingsRouter from './routes/listings'
import listingImagesRouter from './routes/listingImages'
import conversationsRouter from './routes/conversations'
import messagesRouter from './routes/messages'
import reviewsRouter from './routes/reviews'

const app = express()
const httpServer = createServer(app)
const port = process.env.PORT || 3000

app.use(helmet())
app.use(cors({ origin: process.env.CLIENT_URL }))
app.use(morgan('dev'))
app.use(express.json())

const isDev = process.env.NODE_ENV !== 'production'

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isDev ? 2000 : 100,
  standardHeaders: true,
  legacyHeaders: false,
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isDev ? 500 : 20,
  standardHeaders: true,
  legacyHeaders: false,
})

app.use('/api', apiLimiter)
app.use('/api/auth', authLimiter)

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' })
})

app.use('/api/auth', authRouter)
app.use('/api/users', usersRouter)
app.use('/api/listings/:id/images', listingImagesRouter)
app.use('/api/listings', listingsRouter)
app.use('/api/conversations/:conversationId/messages', messagesRouter)
app.use('/api/conversations', conversationsRouter)
app.use('/api', reviewsRouter)

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' })
})

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err)
  res.status(500).json({
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
  })
})

// ─── Socket.io ───────────────────────────────────────────────────────────────

const io = initSocket(httpServer, process.env.CLIENT_URL!)

// Authenticate every socket connection using the JWT access token
io.use((socket, next) => {
  const token = socket.handshake.auth.token as string | undefined
  if (!token) return next(new Error('Unauthorized'))
  try {
    const payload = verifyAccessToken(token)
    socket.data.userId = payload.userId
    next()
  } catch {
    next(new Error('Unauthorized'))
  }
})

io.on('connection', async (socket) => {
  const userId: number = socket.data.userId

  // Each user gets a personal room for conversation-list updates
  socket.join(`user:${userId}`)

  // Join all existing conversation rooms for this user
  try {
    const conversations = await prisma.conversation.findMany({
      where: { OR: [{ buyerId: userId }, { sellerId: userId }] },
      select: { id: true },
    })
    conversations.forEach((c) => socket.join(`conversation:${c.id}`))
  } catch {
    // Non-fatal — polling is the fallback
  }

  // Client calls this after starting a new conversation so it gets real-time messages
  socket.on('join_conversation', (conversationId: number) => {
    socket.join(`conversation:${conversationId}`)
  })
})

// ─────────────────────────────────────────────────────────────────────────────

httpServer.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
