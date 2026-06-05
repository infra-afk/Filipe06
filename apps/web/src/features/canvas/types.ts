export interface CanvasItem {
  id: string
  canvas_id: string
  section_id: string
  title: string
  description: string | null
  position: number
  color: string
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface CanvasSection {
  id: string
  canvas_id: string
  key: string
  title: string
  description: string | null
  icon: string | null
  position: number
  items: CanvasItem[]
}

export interface Canvas {
  id: string
  owner_id: string
  name: string
  description: string | null
  status: string
  created_at: string
  updated_at: string
  sections?: CanvasSection[]
}
