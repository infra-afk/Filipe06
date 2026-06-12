import { Router, Response } from 'express'
import { authMiddleware, AuthRequest } from '../../middleware/auth'
import { updateItem, deleteItem } from './canvas.repository'
import { updateItemSchema } from './canvas.schemas'

const router = Router()
router.use(authMiddleware as any)

router.patch('/:itemId', async (req: AuthRequest, res: Response) => {
  const parsed = updateItemSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  try {
    const item = await updateItem(req.params.itemId, req.userId!, parsed.data)
    res.json(item)
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

router.delete('/:itemId', async (req: AuthRequest, res: Response) => {
  try {
    await deleteItem(req.params.itemId, req.userId!)
    res.status(204).send()
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

export default router
