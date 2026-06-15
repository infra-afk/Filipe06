import { Router, Request, Response } from 'express'
import { registerSchema, loginSchema } from './auth.schemas'
import { registerUser, loginUser, listUsers, deactivateUser, reactivateUser } from './auth.service'
import { authMiddleware, AuthRequest } from '../middleware/auth'

const router = Router()

router.post('/register', async (req: Request, res: Response) => {
  const result = registerSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ error: result.error.issues[0].message })
  }

  try {
    const { token, user } = await registerUser(
      result.data.email,
      result.data.password,
      result.data.full_name
    )
    return res.status(201).json({ token, user })
  } catch (err: any) {
    return res.status(400).json({ error: err.message })
  }
})

router.post('/login', async (req: Request, res: Response) => {
  const result = loginSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ error: result.error.issues[0].message })
  }

  try {
    const { token, user } = await loginUser(result.data.email, result.data.password)
    return res.json({ token, user })
  } catch (err: any) {
    return res.status(401).json({ error: err.message })
  }
})

// ─── Gestão de usuários (requer autenticação) ─────────────────────────────────

router.get('/users', authMiddleware as any, async (_req: AuthRequest, res: Response) => {
  try {
    res.json(await listUsers())
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

router.patch('/users/:id/deactivar', authMiddleware as any, async (req: AuthRequest, res: Response) => {
  try {
    await deactivateUser(req.params.id)
    res.json({ ok: true })
  } catch (e: any) {
    res.status(400).json({ error: e.message })
  }
})

router.patch('/users/:id/reativar', authMiddleware as any, async (req: AuthRequest, res: Response) => {
  try {
    await reactivateUser(req.params.id)
    res.json({ ok: true })
  } catch (e: any) {
    res.status(400).json({ error: e.message })
  }
})

export default router
