import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret'

export interface AuthRequest extends Request {
  userId?: string
  userEmail?: string
  userRole?: string
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string; email: string; role?: string }
    req.userId = payload.sub
    req.userEmail = payload.email
    req.userRole = payload.role
    next()
  } catch {
    return res.status(401).json({ error: 'Token inválido ou expirado' })
  }
}

// Exige que o usuário autenticado seja admin. Usar SEMPRE após authMiddleware.
export function adminMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Acesso restrito a administradores' })
  }
  next()
}
