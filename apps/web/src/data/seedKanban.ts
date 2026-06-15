// Limpeza única: remove os cards fictícios de teste do localStorage.
// Antes este arquivo semeava 40 cards de exemplo; agora ele apenas garante
// que nenhum card fictício remanescente apareça no Kanban.

const SEED_IDS = [
  '1', '2', '3', '4', '5', '6', '7',
  ...Array.from({ length: 40 }, (_, i) => `card-${String(i + 1).padStart(3, '0')}`),
]

export function purgeSeedCards(): void {
  try {
    const stored = JSON.parse(localStorage.getItem('chua_cards') || '[]') as { id: string }[]
    const cleaned = stored.filter(c => !SEED_IDS.includes(c.id))
    if (cleaned.length !== stored.length) {
      localStorage.setItem('chua_cards', JSON.stringify(cleaned))
    }
  } catch {
    // localStorage indisponível ou JSON inválido — nada a fazer
  }
}
