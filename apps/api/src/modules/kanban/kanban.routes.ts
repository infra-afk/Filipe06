import { Router, Response } from 'express'
import { authMiddleware, AuthRequest } from '../../middleware/auth'
import { listCards, upsertCard, archiveCard, removeCard } from './kanban.repository'

const router = Router()
router.use(authMiddleware as any)

router.get('/', async (_req: AuthRequest, res: Response) => {
  try {
    res.json(await listCards())
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    await upsertCard({ ...req.body, id: req.params.id })
    res.json({ ok: true })
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

router.patch('/:id/archive', async (_req: AuthRequest, res: Response) => {
  try {
    await archiveCard(_req.params.id)
    res.json({ ok: true })
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    await removeCard(req.params.id)
    res.status(204).send()
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

export default router
