import { supabase } from './supabase'

const SECTIONS_SEED = [
  { key: 'objetivos',   title: 'Objetivos',   position: 0 },
  { key: 'indicadores', title: 'Indicadores', position: 1 },
  { key: 'pessoas',     title: 'Pessoas',     position: 2 },
  { key: 'decisoes',    title: 'Decisões',    position: 3 },
  { key: 'dados',       title: 'Dados',       position: 4 },
  { key: 'analises',    title: 'Análises',    position: 5 },
  { key: 'alertas',     title: 'Alertas',     position: 6 },
  { key: 'agentes',     title: 'Agentes',     position: 7 },
  { key: 'automacoes',  title: 'Automações',  position: 8 },
]

async function getUser() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')
  return user
}

export function api(_token?: string) {
  return {
    canvases: {
      list: async () => {
        const user = await getUser()
        const { data, error } = await supabase
          .from('canvases')
          .select('*')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false })
        if (error) throw new Error(error.message)
        return data
      },

      get: async (id: string) => {
        const { data: canvas, error } = await supabase
          .from('canvases')
          .select('*')
          .eq('id', id)
          .single()
        if (error) throw new Error(error.message)

        const { data: sections, error: secErr } = await supabase
          .from('canvas_sections')
          .select('*')
          .eq('canvas_id', id)
          .order('position', { ascending: true })
        if (secErr) throw new Error(secErr.message)

        const { data: items, error: itemErr } = await supabase
          .from('canvas_items')
          .select('*')
          .eq('canvas_id', id)
          .order('position', { ascending: true })
        if (itemErr) throw new Error(itemErr.message)

        return {
          ...canvas,
          sections: (sections || []).map(s => ({
            ...s,
            items: (items || []).filter(i => i.section_id === s.id),
          })),
        }
      },

      create: async (data: { name: string; description?: string; seed?: boolean }) => {
        const user = await getUser()
        const { data: canvas, error } = await supabase
          .from('canvases')
          .insert({ name: data.name, description: data.description || null, owner_id: user.id, status: 'active' })
          .select()
          .single()
        if (error) throw new Error(error.message)

        if (data.seed !== false) {
          const sectionsToInsert = SECTIONS_SEED.map(s => ({
            canvas_id: canvas.id,
            key: s.key,
            title: s.title,
            position: s.position,
          }))
          const { error: secErr } = await supabase
            .from('canvas_sections')
            .insert(sectionsToInsert)
          if (secErr) throw new Error(secErr.message)
        }

        return canvas
      },

      update: async (id: string, data: { name?: string; description?: string | null; status?: string }) => {
        const { data: canvas, error } = await supabase
          .from('canvases')
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single()
        if (error) throw new Error(error.message)
        return canvas
      },

      delete: async (id: string) => {
        const { error } = await supabase.from('canvases').delete().eq('id', id)
        if (error) throw new Error(error.message)
      },

      createItem: async (canvasId: string, data: {
        section_id: string
        title: string
        description?: string | null
        color?: string
      }) => {
        const user = await getUser()
        const { data: existing } = await supabase
          .from('canvas_items')
          .select('position')
          .eq('section_id', data.section_id)
          .order('position', { ascending: false })
          .limit(1)
        const position = existing && existing.length > 0 ? existing[0].position + 1 : 0

        const { data: item, error } = await supabase
          .from('canvas_items')
          .insert({
            canvas_id: canvasId,
            section_id: data.section_id,
            title: data.title,
            description: data.description || null,
            color: data.color || 'yellow',
            position,
            metadata: {},
          })
          .select()
          .single()
        if (error) throw new Error(error.message)
        return item
      },

      reorderItems: async (_canvasId: string, data: {
        section_id: string
        items: Array<{ id: string; position: number }>
      }) => {
        for (const item of data.items) {
          await supabase
            .from('canvas_items')
            .update({ position: item.position })
            .eq('id', item.id)
        }
      },
    },

    items: {
      update: async (id: string, data: { title?: string; description?: string | null; color?: string }) => {
        const { data: item, error } = await supabase
          .from('canvas_items')
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single()
        if (error) throw new Error(error.message)
        return item
      },

      delete: async (id: string) => {
        const { error } = await supabase.from('canvas_items').delete().eq('id', id)
        if (error) throw new Error(error.message)
      },
    },
  }
}
