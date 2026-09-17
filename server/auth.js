import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
import { pool } from './db.js'

const scrypt = promisify(scryptCallback)
const SESSION_DAYS = 7
const tokenHash = token => createHash('sha256').update(token).digest('hex')

export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const hash = await scrypt(password, salt, 64)
  return `scrypt:${salt}:${hash.toString('hex')}`
}

export async function verifyPassword(password, stored) {
  const [algorithm, salt, encoded] = stored.split(':')
  if (algorithm !== 'scrypt' || !salt || !encoded) return false
  const expected = Buffer.from(encoded, 'hex')
  const actual = await scrypt(password, salt, expected.length)
  return timingSafeEqual(expected, actual)
}

export function readCookie(req) {
  const match = req.headers.cookie?.match(/(?:^|;\s*)ngo_session=([^;]+)/)
  return match?.[1] || null
}

export async function createSession(adminId) {
  const token = randomBytes(32).toString('hex')
  await pool.query('INSERT INTO sessions (token_hash, admin_id, expires_at) VALUES ($1, $2, now() + interval \'7 days\')', [tokenHash(token), adminId])
  return token
}

export async function getSession(req) {
  const token = readCookie(req)
  if (!token) return null
  const { rows } = await pool.query(`
    SELECT admins.id AS admin_id, admins.email, admins.organisation_id
    FROM sessions JOIN admins ON admins.id = sessions.admin_id
    WHERE sessions.token_hash = $1 AND sessions.expires_at > now()
  `, [tokenHash(token)])
  return rows[0] || null
}

export async function deleteSession(req) {
  const token = readCookie(req)
  if (token) await pool.query('DELETE FROM sessions WHERE token_hash = $1', [tokenHash(token)])
}

export const sessionCookie = token => `ngo_session=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${SESSION_DAYS * 86400}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
export const clearSessionCookie = () => `ngo_session=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
