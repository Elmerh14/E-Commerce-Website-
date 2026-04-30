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

export default router
