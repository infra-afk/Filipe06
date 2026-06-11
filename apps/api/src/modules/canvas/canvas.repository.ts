import { pool } from '../../db'
import { DEFAULT_SECTIONS, DEFAULT_ITEMS } from './default-canvas'

export async function listCanvases(userId: string) {
  const { rows } = await pool.query(
    `SELECT * FROM canvases WHERE owner_id = $1 AND deleted_at IS NULL ORDER BY created_at DESC`,
    [userId]
  )
  return rows
}

export async function getCanvas(canvasId: string, userId: string) {
  const { rows: canvasRows } = await pool.query(
    `SELECT * FROM canvases WHERE id = $1 AND owner_id = $2 AND deleted_at IS NULL`,
    [canvasId, userId]
  )
  if (canvasRows.length === 0) throw new Error('Canvas não encontrado')
  const canvas = canvasRows[0]

  const { rows: sections } = await pool.query(
    `SELECT * FROM canvas_sections WHERE canvas_id = $1 ORDER BY position`,
    [canvasId]
  )

  const { rows: items } = await pool.query(
    `SELECT * FROM canvas_items WHERE canvas_id = $1 AND deleted_at IS NULL ORDER BY position`,
    [canvasId]
  )

  const sectionsWithItems = sections.map(s => ({
    ...s,
    items: items.filter(i => i.section_id === s.id),
  }))

  return { ...canvas, sections: sectionsWithItems }
}

export async function createCanvas(
  userId: string,
  data: { name: string; description?: string; seed?: boolean }
) {
  const { rows } = await pool.query(
    `INSERT INTO canvases (owner_id, name, description) VALUES ($1, $2, $3) RETURNING *`,
    [userId, data.name, data.description || null]
  )
  const canvas = rows[0]

  if (data.seed) {
    for (const section of DEFAULT_SECTIONS) {
      const { rows: sRows } = await pool.query(
        `INSERT INTO canvas_sections (canvas_id, owner_id, key, title, description, icon, position)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [canvas.id, userId, section.key, section.title, section.description || null, section.icon || null, section.position]
      )
      const savedSection = sRows[0]
      const titles = DEFAULT_ITEMS[section.key] || []
      for (let i = 0; i < titles.length; i++) {
        await pool.query(
          `INSERT INTO canvas_items (canvas_id, section_id, owner_id, title, position)
           VALUES ($1, $2, $3, $4, $5)`,
          [canvas.id, savedSection.id, userId, titles[i], i]
        )
      }
    }
  }

  return canvas
}

export async function updateCanvas(
  canvasId: string,
  userId: string,
  data: { name?: string; description?: string | null; status?: string }
) {
  const fields: string[] = []
  const values: any[] = []
  let idx = 1

  if (data.name !== undefined) { fields.push(`name = $${idx++}`); values.push(data.name) }
  if (data.description !== undefined) { fields.push(`description = $${idx++}`); values.push(data.description) }
  if (data.status !== undefined) { fields.push(`status = $${idx++}`); values.push(data.status) }

  if (fields.length === 0) throw new Error('Nenhum campo para atualizar')

  values.push(canvasId, userId)
  const { rows } = await pool.query(
    `UPDATE canvases SET ${fields.join(', ')} WHERE id = $${idx++} AND owner_id = $${idx} RETURNING *`,
    values
  )
  if (rows.length === 0) throw new Error('Canvas não encontrado')
  return rows[0]
}

export async function deleteCanvas(canvasId: string, userId: string) {
  await pool.query(
    `UPDATE canvases SET deleted_at = now() WHERE id = $1 AND owner_id = $2`,
    [canvasId, userId]
  )
}

export async function createItem(
  canvasId: string,
  userId: string,
  data: { section_id: string; title: string; description?: string | null; color?: string; metadata?: object }
) {
  const { rows: pos } = await pool.query(
    `SELECT COALESCE(MAX(position), -1) + 1 AS next FROM canvas_items WHERE section_id = $1 AND deleted_at IS NULL`,
    [data.section_id]
  )
  const nextPosition = pos[0].next

  const { rows } = await pool.query(
    `INSERT INTO canvas_items (canvas_id, section_id, owner_id, title, description, color, metadata, position)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [canvasId, data.section_id, userId, data.title, data.description || null, data.color || 'yellow', data.metadata || {}, nextPosition]
  )
  return rows[0]
}

export async function updateItem(
  itemId: string,
  userId: string,
  data: { title?: string; description?: string | null; color?: string; metadata?: object }
) {
  const fields: string[] = []
  const values: any[] = []
  let idx = 1

  if (data.title !== undefined) { fields.push(`title = $${idx++}`); values.push(data.title) }
  if (data.description !== undefined) { fields.push(`description = $${idx++}`); values.push(data.description) }
  if (data.color !== undefined) { fields.push(`color = $${idx++}`); values.push(data.color) }
  if (data.metadata !== undefined) { fields.push(`metadata = $${idx++}`); values.push(data.metadata) }

  if (fields.length === 0) throw new Error('Nenhum campo para atualizar')

  values.push(itemId, userId)
  const { rows } = await pool.query(
    `UPDATE canvas_items SET ${fields.join(', ')} WHERE id = $${idx++} AND owner_id = $${idx} RETURNING *`,
    values
  )
  if (rows.length === 0) throw new Error('Item não encontrado')
  return rows[0]
}

export async function deleteItem(itemId: string, userId: string) {
  await pool.query(
    `UPDATE canvas_items SET deleted_at = now() WHERE id = $1 AND owner_id = $2`,
    [itemId, userId]
  )
}

export async function reorderItems(updates: Array<{ id: string; position: number }>) {
  await Promise.all(
    updates.map(({ id, position }) =>
      pool.query(`UPDATE canvas_items SET position = $1 WHERE id = $2`, [position, id])
    )
  )
}
