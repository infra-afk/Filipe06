import { z } from 'zod'

export const createCanvasSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  seed: z.boolean().optional(),
})

export const updateCanvasSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  description: z.string().max(500).nullable().optional(),
  status: z.enum(['active', 'archived']).optional(),
})

export const createItemSchema = z.object({
  section_id: z.string().uuid(),
  title: z.string().min(1).max(120),
  description: z.string().max(1000).nullable().optional(),
  color: z.string().optional().default('yellow'),
  metadata: z.record(z.string(), z.unknown()).optional().default({}),
})

export const updateItemSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  description: z.string().max(1000).nullable().optional(),
  color: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export const reorderItemsSchema = z.object({
  section_id: z.string().uuid(),
  items: z.array(z.object({
    id: z.string().uuid(),
    position: z.number().int().min(0),
  })),
})
