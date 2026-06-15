import { pool } from '../../db'

export async function listCards() {
  const { rows } = await pool.query(
    `SELECT card_data FROM kanban_cards ORDER BY created_at`
  )
  return rows.map(r => r.card_data)
}

export async function upsertCard(card: Record<string, unknown>) {
  const id = card.id as string
  const arquivado = (card.arquivado as boolean) ?? false
  await pool.query(
    `INSERT INTO kanban_cards (id, arquivado, card_data)
     VALUES ($1, $2, $3)
     ON CONFLICT (id) DO UPDATE SET
       arquivado  = EXCLUDED.arquivado,
       card_data  = EXCLUDED.card_data,
       updated_at = now()`,
    [id, arquivado, card]
  )
}

export async function archiveCard(id: string) {
  await pool.query(
    `UPDATE kanban_cards
     SET arquivado  = true,
         card_data  = card_data
                    || jsonb_build_object(
                         'arquivado', true,
                         'dataArquivamento', to_char(now(), 'YYYY-MM-DD')
                       ),
         updated_at = now()
     WHERE id = $1`,
    [id]
  )
}

export async function removeCard(id: string) {
  await pool.query(`DELETE FROM kanban_cards WHERE id = $1`, [id])
}
