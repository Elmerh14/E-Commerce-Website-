import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { prisma } from '../lib/prisma'
import { requireAuth } from '../middleware/auth'

const router = Router({ mergeParams: true })

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

const imageSchema = z.object({
  imageUrl: z.string().url(),
  sortOrder: z.number().int().min(0).optional().default(0),
})

const reorderSchema = z.object({
  images: z.array(z.object({ id: z.number().int(), sortOrder: z.number().int().min(0) })),
})

async function getListingAndVerifyOwner(listingId: number, userId: number, res: Response): Promise<boolean> {
  const listing = await prisma.listing.findUnique({ where: { id: listingId } })
  if (!listing) {
    res.status(404).json({ error: 'Listing not found' })
    return false
  }
  if (listing.userId !== userId) {
    res.status(403).json({ error: 'Forbidden' })
    return false
  }
  return true
}

// POST /api/listings/:id/images/presign
router.post('/presign', requireAuth, async (req: Request, res: Response) => {
  const listingId = parseInt(req.params.id as string)
  if (isNaN(listingId)) {
    res.status(400).json({ error: 'Invalid listing ID' })
    return
  }

  const owned = await getListingAndVerifyOwner(listingId, req.user!.userId, res)
  if (!owned) return

  const result = presignSchema.safeParse(req.body)
  if (!result.success) {
    res.status(400).json({ error: result.error.issues })
    return
  }

  const { contentType } = result.data
  const ext = ALLOWED_CONTENT_TYPES[contentType]
  const key = `listings/${listingId}/${uuidv4()}.${ext}`

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: key,
    ContentType: contentType,
  })

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 })
  const imageUrl = `${process.env.CLOUDFRONT_URL}/${key}`

  res.status(200).json({ uploadUrl, imageUrl })
})

// POST /api/listings/:id/images
router.post('/', requireAuth, async (req: Request, res: Response) => {
  const listingId = parseInt(req.params.id as string)
  if (isNaN(listingId)) {
    res.status(400).json({ error: 'Invalid listing ID' })
    return
  }

  const owned = await getListingAndVerifyOwner(listingId, req.user!.userId, res)
  if (!owned) return

  const result = imageSchema.safeParse(req.body)
  if (!result.success) {
    res.status(400).json({ error: result.error.issues })
    return
  }

  const image = await prisma.listingImage.create({
    data: { listingId, imageUrl: result.data.imageUrl, sortOrder: result.data.sortOrder },
  })

  res.status(201).json({ image })
})

// DELETE /api/listings/:id/images/:imageId
router.delete('/:imageId', requireAuth, async (req: Request, res: Response) => {
  const listingId = parseInt(req.params.id as string)
  const imageId = parseInt(req.params.imageId as string)
  if (isNaN(listingId) || isNaN(imageId)) {
    res.status(400).json({ error: 'Invalid ID' })
    return
  }

  const owned = await getListingAndVerifyOwner(listingId, req.user!.userId, res)
  if (!owned) return

  const image = await prisma.listingImage.findUnique({ where: { id: imageId } })
  if (!image || image.listingId !== listingId) {
    res.status(404).json({ error: 'Image not found' })
    return
  }

  const cloudfrontUrl = process.env.CLOUDFRONT_URL!
  const key = image.imageUrl.replace(`${cloudfrontUrl}/`, '')

  await prisma.listingImage.delete({ where: { id: imageId } })
  await s3.send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET_NAME!, Key: key }))

  res.status(200).json({ message: 'Image deleted' })
})

// PATCH /api/listings/:id/images/reorder
router.patch('/reorder', requireAuth, async (req: Request, res: Response) => {
  const listingId = parseInt(req.params.id as string)
  if (isNaN(listingId)) {
    res.status(400).json({ error: 'Invalid listing ID' })
    return
  }

  const owned = await getListingAndVerifyOwner(listingId, req.user!.userId, res)
  if (!owned) return

  const result = reorderSchema.safeParse(req.body)
  if (!result.success) {
    res.status(400).json({ error: result.error.issues })
    return
  }

  await prisma.$transaction(
    result.data.images.map(({ id, sortOrder }) =>
      prisma.listingImage.update({ where: { id }, data: { sortOrder } })
    )
  )

  res.status(200).json({ message: 'Order updated' })
})

export default router
