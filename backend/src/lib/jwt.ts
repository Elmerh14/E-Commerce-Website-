import jwt from 'jsonwebtoken'

export type JwtPayload = {
  userId: number
  email: string
}

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  })
}

export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  })
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as JwtPayload
}
