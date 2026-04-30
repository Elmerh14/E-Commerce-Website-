import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { prisma } from '../lib/prisma'
import { requireAuth } from '../middleware/auth'

const router = Router()

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const ALLOWED_CONTENT_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
  'image/heif': 'heif',
}

const presignSchema = z.object({
  contentType: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']),
})

// GET /api/users/listings
router.get('/listings', requireAuth, async (req: Request, res: Response) => {
  const listings = await prisma.listing.findMany({
    where: { userId: req.user!.userId },
    include: {
      images: { orderBy: { sortOrder: 'asc' }, take: 1 },
    },
    orderBy: { createdAt: 'desc' },
  })
  res.status(200).json({ listings })
})

// POST /api/users/photo/presign
router.post('/photo/presign', requireAuth, async (req: Request, res: Response) => {
  const result = presignSchema.safeParse(req.body)
  if (!result.success) {
    res.status(400).json({ error: result.error.issues })
    return
  }

  const { contentType } = result.data
  const ext = ALLOWED_CONTENT_TYPES[contentType]
  const key = `users/${req.user!.userId}/${uuidv4()}.${ext}`

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: key,
    ContentType: contentType,
  })

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 })
  const photoUrl = `${process.env.CLOUDFRONT_URL}/${key}`

  res.status(200).json({ uploadUrl, photoUrl })
})

// PATCH /api/users/photo
router.patch('/photo', requireAuth, async (req: Request, res: Response) => {
  const result = z.object({ photoUrl: z.string().url() }).safeParse(req.body)
  if (!result.success) {
    res.status(400).json({ error: result.error.issues })
    return
  }

  const user = await prisma.user.update({
    where: { id: req.user!.userId },
    data: { photoUrl: result.data.photoUrl },
    select: { id: true, email: true, username: true, photoUrl: true },
  })

  res.status(200).json({ user })
})

// GET /api/users/:userId
router.get('/:userId', async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId as string)
  if (isNaN(userId)) {
    res.status(400).json({ error: 'Invalid user ID' })
    return
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, photoUrl: true },
  })

  if (!user) {
    res.status(404).json({ error: 'User not found' })
    return
  }

  res.status(200).json({ user })
})

export default router
