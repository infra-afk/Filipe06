import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import multer from 'multer'
import fs from 'fs'
import canvasRoutes from './modules/canvas/canvas.routes'
import itemsRoutes from './modules/canvas/items.routes'
import authRoutes from './auth/auth.routes'
import kanbanRoutes from './modules/kanban/kanban.routes'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }))
app.use(express.json())

// ── Servir arquivos de upload estáticos ──────────────────────────────────────
const UPLOADS_DIR = process.env.UPLOADS_DIR || '/home/srv_app/dashboard/uploads'
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true })
app.use('/uploads', express.static(UPLOADS_DIR))

// ── Upload de logo ───────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.png'
    cb(null, `logo${ext}`)
  },
})
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif']
    cb(null, allowed.includes(file.mimetype))
  },
})

app.post('/api/upload/logo', upload.single('logo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado ou tipo não permitido' })
  res.json({ url: `/uploads/${req.file.filename}` })
})

app.delete('/api/upload/logo', (_req, res) => {
  const files = fs.readdirSync(UPLOADS_DIR).filter(f => f.startsWith('logo'))
  files.forEach(f => fs.unlinkSync(path.join(UPLOADS_DIR, f)))
  res.json({ ok: true })
})

app.use('/auth', authRoutes)
app.use('/api/canvases', canvasRoutes)
app.use('/api/items', itemsRoutes)
app.use('/api/kanban', kanbanRoutes)

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`✅ API rodando em http://localhost:${PORT}`)
})
