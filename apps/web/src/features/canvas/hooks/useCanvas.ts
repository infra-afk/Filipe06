import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { api } from '../../../lib/api'
import type { Canvas, CanvasItem, CanvasSection } from '../types'
import { arrayMove } from '@dnd-kit/sortable'

export function useCanvas(canvasId: string) {
  const { session } = useAuth()
  const [canvas, setCanvas] = useState<Canvas | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const token = session?.access_token || ''
  const client = api(token)

  const load = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const data = await client.canvases.get(canvasId)
      setCanvas(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [canvasId, token])

  useEffect(() => { load() }, [load])

  function updateSectionItems(sectionId: string, items: CanvasItem[]) {
    setCanvas(prev => {
      if (!prev) return prev
      return {
        ...prev,
        sections: prev.sections?.map(s =>
          s.id === sectionId ? { ...s, items } : s
        ),
      }
    })
  }

  async function addItem(sectionId: string, title: string, description?: string) {
    const section = canvas?.sections?.find(s => s.id === sectionId)
    if (!section) return
    const optimistic: CanvasItem = {
      id: `tmp-${Date.now()}`,
      canvas_id: canvasId,
      section_id: sectionId,
      title,
      description: description || null,
      position: (section.items?.length ?? 0),
      color: 'yellow',
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    updateSectionItems(sectionId, [...(section.items || []), optimistic])
    try {
      const item = await client.canvases.createItem(canvasId, { section_id: sectionId, title, description })
      setCanvas(prev => {
        if (!prev) return prev
        return {
          ...prev,
          sections: prev.sections?.map(s =>
            s.id === sectionId
              ? { ...s, items: [...(s.items || []).filter(i => i.id !== optimistic.id), item] }
              : s
          ),
        }
      })
    } catch (e: any) {
      updateSectionItems(sectionId, section.items || [])
      setError(e.message)
    }
  }

  async function editItem(itemId: string, data: { title?: string; description?: string | null }) {
    setCanvas(prev => {
      if (!prev) return prev
      return {
        ...prev,
        sections: prev.sections?.map(s => ({
          ...s,
          items: s.items.map(i => i.id === itemId ? { ...i, ...data } : i),
        })),
      }
    })
    try {
      await client.items.update(itemId, data)
    } catch (e: any) {
      setError(e.message)
      load()
    }
  }

  async function removeItem(itemId: string, sectionId: string) {
    const section = canvas?.sections?.find(s => s.id === sectionId)
    const prev = section?.items || []
    updateSectionItems(sectionId, prev.filter(i => i.id !== itemId))
    try {
      await client.items.delete(itemId)
    } catch (e: any) {
      updateSectionItems(sectionId, prev)
      setError(e.message)
    }
  }

  async function reorderInSection(sectionId: string, oldIndex: number, newIndex: number) {
    const section = canvas?.sections?.find(s => s.id === sectionId)
    if (!section) return
    const reordered = arrayMove(section.items, oldIndex, newIndex).map((item, i) => ({
      ...item,
      position: i,
    }))
    updateSectionItems(sectionId, reordered)
    setSaving(true)
    try {
      await client.canvases.reorderItems(canvasId, {
        section_id: sectionId,
        items: reordered.map(i => ({ id: i.id, position: i.position })),
      })
    } catch (e: any) {
      updateSectionItems(sectionId, section.items)
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return { canvas, loading, saving, error, addItem, editItem, removeItem, reorderInSection, reload: load }
}

export function useCanvasList() {
  const { session } = useAuth()
  const [canvases, setCanvases] = useState<Canvas[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const token = session?.access_token || ''
  const client = api(token)

  useEffect(() => {
    if (!token) return
    setLoading(true)
    client.canvases.list()
      .then(data => setCanvases(data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [token])

  async function createCanvas(name: string, description?: string) {
    const canvas = await client.canvases.create({ name, description, seed: true })
    setCanvases(prev => [canvas, ...prev])
    return canvas
  }

  async function deleteCanvas(id: string) {
    await client.canvases.delete(id)
    setCanvases(prev => prev.filter(c => c.id !== id))
  }

  return { canvases, loading, error, createCanvas, deleteCanvas }
}
