import { Router, Request, Response } from 'express'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../lib/jwt'
import { requireAuth } from '../middleware/auth'

const router = Router()

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  username: z.string().min(2),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

router.post('/register', async (req: Request, res: Response) => {
  const result = registerSchema.safeParse(req.body)
  if (!result.success) {
    res.status(400).json({ error: result.error.issues })
    return
  }

  const { email, password, username } = result.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    res.status(409).json({ error: 'Email already in use' })
    return
  }

  const passhash = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: { email, passhash, username },
    select: { id: true, email: true, username: true, photoUrl: true },
  })

  const accessToken = signAccessToken({ userId: user.id, email: user.email })
  const refreshToken = signRefreshToken({ userId: user.id, email: user.email })

  res.status(201).json({ user, accessToken, refreshToken })
})

router.post('/login', async (req: Request, res: Response) => {
  const result = loginSchema.safeParse(req.body)
  if (!result.success) {
    res.status(400).json({ error: result.error.issues })
    return
  }

  const { email, password } = result.data

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    res.status(401).json({ error: 'Invalid credentials' })
    return
  }

  const valid = await bcrypt.compare(password, user.passhash)
  if (!valid) {
    res.status(401).json({ error: 'Invalid credentials' })
    return
  }

  const { passhash: _, ...safeUser } = user

  const accessToken = signAccessToken({ userId: user.id, email: user.email })
  const refreshToken = signRefreshToken({ userId: user.id, email: user.email })

  res.status(200).json({ user: safeUser, accessToken, refreshToken })
})

router.post('/refresh', async (req: Request, res: Response) => {
  const { refreshToken } = req.body
  if (!refreshToken) {
    res.status(400).json({ error: 'Refresh token required' })
    return
  }

  try {
    const payload = verifyRefreshToken(refreshToken)
    const accessToken = signAccessToken({ userId: payload.userId, email: payload.email })
    const newRefreshToken = signRefreshToken({ userId: payload.userId, email: payload.email })
    res.status(200).json({ accessToken, refreshToken: newRefreshToken })
  } catch {
    res.status(401).json({ error: 'Invalid or expired refresh token' })
  }
})

router.post('/logout', (_req: Request, res: Response) => {
  res.status(200).json({ message: 'Logged out' })
})

router.get('/me', requireAuth, async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: { id: true, email: true, username: true, photoUrl: true },
  })

  if (!user) {
    res.status(404).json({ error: 'User not found' })
    return
  }

  res.status(200).json({ user })
})

export default router
