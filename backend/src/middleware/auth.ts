import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken, JwtPayload } from '../lib/jwt'

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

function extractToken(req: Request): string | null {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) return null
  return header.slice(7)
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = extractToken(req)
  if (!token) {
    res.status(401).json({ error: 'Missing authorization token' })
    return
  }
  try {
    req.user = verifyAccessToken(token)
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = extractToken(req)
  if (token) {
    try {
      req.user = verifyAccessToken(token)
    } catch {
      // token present but invalid — proceed without user
    }
  }
  next()
}
