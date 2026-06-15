import { Router, Response } from 'express'
import { authMiddleware, AuthRequest } from '../../middleware/auth'
import {
  listCanvases, getCanvas, createCanvas, updateCanvas, deleteCanvas,
  createItem, reorderItems,
} from './canvas.repository'
import {
  createCanvasSchema, updateCanvasSchema,
  createItemSchema, reorderItemsSchema,
} from './canvas.schemas'

const router = Router()
router.use(authMiddleware as any)

// ---- Canvases ----

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const data = await listCanvases(req.userId!)
    res.json(data)
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

router.post('/', async (req: AuthRequest, res: Response) => {
  const parsed = createCanvasSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  try {
    const canvas = await createCanvas(req.userId!, parsed.data)
    res.status(201).json(canvas)
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

router.get('/:canvasId', async (req: AuthRequest, res: Response) => {
  try {
    const canvas = await getCanvas(req.params.canvasId, req.userId!)
    res.json(canvas)
  } catch (e: any) {
    res.status(e.message === 'Canvas não encontrado' ? 404 : 500).json({ error: e.message })
  }
})

router.patch('/:canvasId', async (req: AuthRequest, res: Response) => {
  const parsed = updateCanvasSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  try {
    const canvas = await updateCanvas(req.params.canvasId, req.userId!, parsed.data)
    res.json(canvas)
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

router.delete('/:canvasId', async (req: AuthRequest, res: Response) => {
  try {
    await deleteCanvas(req.params.canvasId, req.userId!)
    res.status(204).send()
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

// ---- Items ----

router.post('/:canvasId/items', async (req: AuthRequest, res: Response) => {
  const parsed = createItemSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  try {
    const item = await createItem(req.params.canvasId, req.userId!, parsed.data)
    res.status(201).json(item)
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

router.patch('/:canvasId/items/reorder', async (req: AuthRequest, res: Response) => {
  const parsed = reorderItemsSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  try {
    await reorderItems(parsed.data.items)
    res.json({ ok: true })
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

export default router
