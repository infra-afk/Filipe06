import { createUserClient } from '../../lib/supabase-admin'
import { DEFAULT_SECTIONS, DEFAULT_ITEMS } from './default-canvas'

export async function listCanvases(userId: string, token: string) {
  const db = createUserClient(token)
  const { data, error } = await db
    .from('canvases')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getCanvas(canvasId: string, token: string) {
  const db = createUserClient(token)
  const { data: canvas, error: ce } = await db
    .from('canvases')
    .select('*')
    .eq('id', canvasId)
    .single()
  if (ce) throw ce

  const { data: sections, error: se } = await db
    .from('canvas_sections')
    .select('*')
    .eq('canvas_id', canvasId)
    .order('position')
  if (se) throw se

  const { data: items, error: ie } = await db
    .from('canvas_items')
    .select('*')
    .eq('canvas_id', canvasId)
    .order('position')
  if (ie) throw ie

  const sectionsWithItems = (sections || []).map(s => ({
    ...s,
    items: (items || []).filter(i => i.section_id === s.id),
  }))

  return { ...canvas, sections: sectionsWithItems }
}

export async function createCanvas(
  userId: string,
  token: string,
  data: { name: string; description?: string; seed?: boolean }
) {
  const db = createUserClient(token)
  const { data: canvas, error } = await db
    .from('canvases')
    .insert({ owner_id: userId, name: data.name, description: data.description || null })
    .select()
    .single()
  if (error) throw error

  if (data.seed) {
    const sectionsPayload = DEFAULT_SECTIONS.map(s => ({ ...s, canvas_id: canvas.id }))
    const { data: sections, error: se } = await db
      .from('canvas_sections')
      .insert(sectionsPayload)
      .select()
    if (se) throw se

    const itemsPayload: object[] = []
    for (const section of sections || []) {
      const titles = DEFAULT_ITEMS[section.key] || []
      titles.forEach((title, i) => {
        itemsPayload.push({
          canvas_id: canvas.id,
          section_id: section.id,
          title,
          position: i,
        })
      })
    }
    if (itemsPayload.length > 0) {
      const { error: ie } = await db.from('canvas_items').insert(itemsPayload)
      if (ie) throw ie
    }
  }

  return canvas
}

export async function updateCanvas(
  canvasId: string,
  token: string,
  data: { name?: string; description?: string | null; status?: string }
) {
  const db = createUserClient(token)
  const { data: canvas, error } = await db
    .from('canvases')
    .update(data)
    .eq('id', canvasId)
    .select()
    .single()
  if (error) throw error
  return canvas
}

export async function deleteCanvas(canvasId: string, token: string) {
  const db = createUserClient(token)
  const { error } = await db.from('canvases').delete().eq('id', canvasId)
  if (error) throw error
}

export async function createItem(
  canvasId: string,
  token: string,
  data: { section_id: string; title: string; description?: string | null; color?: string; metadata?: object }
) {
  const db = createUserClient(token)
  const { data: items } = await db
    .from('canvas_items')
    .select('position')
    .eq('section_id', data.section_id)
    .order('position', { ascending: false })
    .limit(1)

  const nextPosition = items && items.length > 0 ? items[0].position + 1 : 0

  const { data: item, error } = await db
    .from('canvas_items')
    .insert({ canvas_id: canvasId, position: nextPosition, ...data })
    .select()
    .single()
  if (error) throw error
  return item
}

export async function updateItem(
  itemId: string,
  token: string,
  data: { title?: string; description?: string | null; color?: string; metadata?: object }
) {
  const db = createUserClient(token)
  const { data: item, error } = await db
    .from('canvas_items')
    .update(data)
    .eq('id', itemId)
    .select()
    .single()
  if (error) throw error
  return item
}

export async function deleteItem(itemId: string, token: string) {
  const db = createUserClient(token)
  const { error } = await db.from('canvas_items').delete().eq('id', itemId)
  if (error) throw error
}

export async function reorderItems(
  token: string,
  updates: Array<{ id: string; position: number }>
) {
  const db = createUserClient(token)
  await Promise.all(
    updates.map(({ id, position }) =>
      db.from('canvas_items').update({ position }).eq('id', id)
    )
  )
}
