import { Request, Response, NextFunction } from 'express'
import { supabaseAdmin } from '../lib/supabase-admin'

export interface AuthRequest extends Request {
  userId?: string
  accessToken?: string
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' })
  }

  const token = authHeader.split(' ')[1]
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)

  if (error || !user) {
    return res.status(401).json({ error: 'Token inválido ou expirado' })
  }

  req.userId = user.id
  req.accessToken = token
  next()
}
