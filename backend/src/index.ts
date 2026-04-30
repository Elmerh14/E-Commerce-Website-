import 'dotenv/config'
import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'

import authRouter from './routes/auth'
import usersRouter from './routes/users'
import listingsRouter from './routes/listings'
import listingImagesRouter from './routes/listingImages'
import conversationsRouter from './routes/conversations'
import messagesRouter from './routes/messages'
import reviewsRouter from './routes/reviews'

const app = express()
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

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
