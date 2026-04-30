import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { requireAuth } from '../middleware/auth'

const router = Router()

const listingBaseSchema = z.object({
  type: z.enum(['SELL', 'BARTER', 'BOTH']),
  title: z.string().min(1).max(45),
  category: z.string().min(1).max(45),
  condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR']),
  description: z.string().min(1).max(255),
  location: z.string().min(1).max(255),
  price: z.number().positive().optional(),
})

const createListingSchema = listingBaseSchema.refine(
  (data) => data.type === 'BARTER' || data.price !== undefined,
  { message: 'Price is required for SELL or BOTH listings', path: ['price'] }
)

const updateListingSchema = listingBaseSchema.partial().refine(
  (data) => {
    if (data.type && data.type !== 'BARTER') return data.price !== undefined
    return true
  },
  { message: 'Price is required for SELL or BOTH listings', path: ['price'] }
)

const statusSchema = z.object({
  status: z.enum(['ACTIVE', 'SOLD', 'TRADED', 'REMOVED']),
})

const userSelect = { id: true, username: true, photoUrl: true }

// GET /api/listings/recent — must be before /:id
router.get('/recent', async (_req: Request, res: Response) => {
  const [forSale, forBarter] = await prisma.$transaction([
    prisma.listing.findMany({
      where: { status: 'ACTIVE', type: { in: ['SELL', 'BOTH'] } },
      include: { user: { select: userSelect } },
      orderBy: { createdAt: 'desc' },
      take: 8,
    }),
    prisma.listing.findMany({
      where: { status: 'ACTIVE', type: { in: ['BARTER', 'BOTH'] } },
      include: { user: { select: userSelect } },
      orderBy: { createdAt: 'desc' },
      take: 8,
    }),
  ])

  res.status(200).json({ forSale, forBarter })
})

// GET /api/listings
router.get('/', async (req: Request, res: Response) => {
  const { search, category, type, minPrice, maxPrice, location, userId, page = '1', limit = '20' } = req.query

  const pageNum = Math.max(1, parseInt(page as string) || 1)
  const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20))
  const skip = (pageNum - 1) * limitNum

  const where: Prisma.ListingWhereInput = { status: 'ACTIVE' }

  if (userId) where.userId = parseInt(userId as string)
  if (search) {
    where.OR = [
      { title: { contains: search as string, mode: 'insensitive' } },
      { description: { contains: search as string, mode: 'insensitive' } },
    ]
  }
  if (category) where.category = category as string
  if (type === 'SELL') where.type = { in: ['SELL', 'BOTH'] }
  else if (type === 'BARTER') where.type = { in: ['BARTER', 'BOTH'] }
  if (location) where.location = { contains: location as string, mode: 'insensitive' }
  if (minPrice || maxPrice) {
    where.price = {
      ...(minPrice ? { gte: parseFloat(minPrice as string) } : {}),
      ...(maxPrice ? { lte: parseFloat(maxPrice as string) } : {}),
    }
  }

  const [listings, total] = await prisma.$transaction([
    prisma.listing.findMany({
      where,
      include: {
        user: { select: userSelect },
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum,
    }),
    prisma.listing.count({ where }),
  ])

  res.status(200).json({
    listings,
    pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
  })
})

// GET /api/listings/:id
router.get('/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string)
  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid listing ID' })
    return
  }

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      user: { select: userSelect },
      images: { orderBy: { sortOrder: 'asc' } },
    },
  })

  if (!listing) {
    res.status(404).json({ error: 'Listing not found' })
    return
  }

  res.status(200).json({ listing })
})

// POST /api/listings
router.post('/', requireAuth, async (req: Request, res: Response) => {
  const result = createListingSchema.safeParse(req.body)
  if (!result.success) {
    res.status(400).json({ error: result.error.issues })
    return
  }

  const { type, title, category, condition, description, location, price } = result.data

  const listing = await prisma.listing.create({
    data: {
      userId: req.user!.userId,
      type,
      title,
      category,
      condition,
      description,
      location,
      price: price ?? null,
    },
  })

  res.status(201).json({ listing })
})

// PATCH /api/listings/:id
router.patch('/:id', requireAuth, async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string)
  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid listing ID' })
    return
  }

  const listing = await prisma.listing.findUnique({ where: { id } })
  if (!listing) {
    res.status(404).json({ error: 'Listing not found' })
    return
  }
  if (listing.userId !== req.user!.userId) {
    res.status(403).json({ error: 'Forbidden' })
    return
  }

  const result = updateListingSchema.safeParse(req.body)
  if (!result.success) {
    res.status(400).json({ error: result.error.issues })
    return
  }

  const updateData: Prisma.ListingUpdateInput = { ...result.data }
  if (result.data.type === 'BARTER') updateData.price = null

  const updated = await prisma.listing.update({ where: { id }, data: updateData })

  res.status(200).json({ listing: updated })
})

// PATCH /api/listings/:id/status
router.patch('/:id/status', requireAuth, async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string)
  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid listing ID' })
    return
  }

  const listing = await prisma.listing.findUnique({ where: { id } })
  if (!listing) {
    res.status(404).json({ error: 'Listing not found' })
    return
  }
  if (listing.userId !== req.user!.userId) {
    res.status(403).json({ error: 'Forbidden' })
    return
  }

  const result = statusSchema.safeParse(req.body)
  if (!result.success) {
    res.status(400).json({ error: result.error.issues })
    return
  }

  const updated = await prisma.listing.update({
    where: { id },
    data: { status: result.data.status },
  })

  res.status(200).json({ listing: updated })
})

// DELETE /api/listings/:id
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string)
  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid listing ID' })
    return
  }

  const listing = await prisma.listing.findUnique({ where: { id } })
  if (!listing) {
    res.status(404).json({ error: 'Listing not found' })
    return
  }
  if (listing.userId !== req.user!.userId) {
    res.status(403).json({ error: 'Forbidden' })
    return
  }

  await prisma.listing.delete({ where: { id } })

  res.status(200).json({ message: 'Listing deleted' })
})

export default router
