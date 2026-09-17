import { pool } from '../db.js'
import { hashPassword } from '../auth.js'

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
const password = process.env.ADMIN_PASSWORD
if (!email || !password || password.length < 12) {
  console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD (at least 12 characters)')
  process.exit(1)
}

const client = await pool.connect()
try {
  await client.query('BEGIN')
  const org = await client.query('INSERT INTO organisations DEFAULT VALUES RETURNING id')
  await client.query('INSERT INTO admins (organisation_id, email, password_hash) VALUES ($1, $2, $3)', [org.rows[0].id, email, await hashPassword(password)])
  await client.query('COMMIT')
  console.log(`Created admin ${email}`)
} catch (error) {
  await client.query('ROLLBACK')
  throw error
} finally {
  client.release()
  await pool.end()
}
