import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { pool } from '../db'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export async function registerUser(email: string, password: string, full_name?: string) {
  const existing = await pool.query('SELECT id FROM app_auth.users WHERE email = $1', [email])
  if (existing.rows.length > 0) {
    throw new Error('Email já cadastrado')
  }

  const password_hash = await bcrypt.hash(password, 12)

  const { rows } = await pool.query(
    `INSERT INTO app_auth.users (email, password_hash, full_name)
     VALUES ($1, $2, $3)
     RETURNING id, email, full_name, created_at`,
    [email, password_hash, full_name || null]
  )

  const user = rows[0]

  await pool.query(
    `INSERT INTO profiles (id, email, full_name) VALUES ($1, $2, $3)
     ON CONFLICT (id) DO NOTHING`,
    [user.id, user.email, user.full_name]
  )

  const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions)

  return { token, user: { id: user.id, email: user.email, full_name: user.full_name } }
}

export async function loginUser(email: string, password: string) {
  const { rows } = await pool.query(
    'SELECT id, email, password_hash, full_name, ativo FROM app_auth.users WHERE email = $1',
    [email]
  )

  if (rows.length === 0) {
    throw new Error('Email ou senha inválidos')
  }

  const user = rows[0]

  if (!user.ativo) {
    throw new Error('Conta desativada. Entre em contato com o administrador.')
  }

  const valid = await bcrypt.compare(password, user.password_hash)

  if (!valid) {
    throw new Error('Email ou senha inválidos')
  }

  const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions)

  return { token, user: { id: user.id, email: user.email, full_name: user.full_name } }
}

export async function listUsers() {
  const { rows } = await pool.query(
    `SELECT id, email, full_name, ativo, created_at
     FROM app_auth.users
     ORDER BY created_at`
  )
  return rows
}

export async function deactivateUser(userId: string) {
  const { rowCount } = await pool.query(
    `UPDATE app_auth.users SET ativo = false WHERE id = $1 AND ativo = true`,
    [userId]
  )
  if (rowCount === 0) throw new Error('Usuário não encontrado ou já desativado')
}

export async function reactivateUser(userId: string) {
  await pool.query(
    `UPDATE app_auth.users SET ativo = true WHERE id = $1`,
    [userId]
  )
}
