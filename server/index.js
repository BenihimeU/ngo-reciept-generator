import express from 'express'
import { resolve } from 'node:path'
import { pool } from './db.js'
import { clearSessionCookie, createSession, deleteSession, getSession, hashPassword, sessionCookie, verifyPassword } from './auth.js'

const app = express()
app.disable('x-powered-by')
app.use(express.json({ limit: '32kb' }))

app.use('/api', (req, res, next) => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    const origin = req.get('origin')
    const expected = process.env.APP_ORIGIN || `http://localhost:${process.env.PORT || 8080}`
    const developmentOrigin = process.env.NODE_ENV !== 'production' && ['http://localhost:5173', 'http://127.0.0.1:5173'].includes(origin)
    if (origin && origin !== expected && !developmentOrigin) return res.status(403).json({ error: 'Origin not allowed' })
  }
  next()
})

const asyncRoute = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
const text = (value, max = 500) => typeof value === 'string' ? value.trim().slice(0, max) : ''
const dateOnly = value => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}
const organisationDto = row => ({
  name: row.name, pan: row.pan, address: row.address, urn: row.urn,
  urnDate: row.urn_date ? row.urn_date.toISOString().slice(0, 10) : '',
  email: row.email, phone: row.phone, signatory: row.signatory, designation: row.designation,
})
const receiptDto = row => ({
  id: row.id, receiptNo: row.receipt_no, donorName: row.donor_name,
  donorIdType: row.donor_id_type, donorId: row.donor_id,
  donorAddress: row.donor_address, donorEmail: row.donor_email,
  amount: row.amount, date: row.donation_date.toISOString().slice(0, 10),
  mode: row.payment_mode, reference: row.reference,
  type: row.donation_type, purpose: row.purpose,
  organisationSnapshot: row.organisation_snapshot,
})

app.get('/api/health', asyncRoute(async (_req, res) => {
  await pool.query('SELECT 1')
  res.json({ status: 'ok' })
}))

app.post('/api/auth/register', asyncRoute(async (req, res) => {
  const input = req.body || {}
  const organisationName = text(input.organisationName, 200)
  const email = text(input.email, 320).toLowerCase()
  const password = input.password
  if (!organisationName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Enter an organisation name and valid email' })
  if (typeof password !== 'string' || password.length < 12 || password.length > 256) return res.status(400).json({ error: 'Password must be 12–256 characters' })
  const client = await pool.connect()
  let adminId
  try {
    await client.query('BEGIN')
    const organisation = await client.query('INSERT INTO organisations (name) VALUES ($1) RETURNING id', [organisationName])
    const admin = await client.query('INSERT INTO admins (organisation_id, email, password_hash) VALUES ($1, $2, $3) RETURNING id', [organisation.rows[0].id, email, await hashPassword(password)])
    adminId = admin.rows[0].id
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    if (error.code === '23505') return res.status(409).json({ error: 'An account with this email already exists' })
    throw error
  } finally { client.release() }
  const token = await createSession(adminId)
  res.set('Set-Cookie', sessionCookie(token)).status(201).json({ email })
}))

app.post('/api/auth/login', asyncRoute(async (req, res) => {
  const input = req.body || {}
  const email = text(input.email, 320).toLowerCase()
  const password = input.password
  if (!email || typeof password !== 'string' || password.length > 256) return res.status(400).json({ error: 'Email and password are required' })
  const { rows } = await pool.query('SELECT id, email, password_hash FROM admins WHERE email = $1', [email])
  if (!rows[0] || !(await verifyPassword(password, rows[0].password_hash))) return res.status(401).json({ error: 'Invalid email or password' })
  const token = await createSession(rows[0].id)
  res.set('Set-Cookie', sessionCookie(token)).json({ email: rows[0].email })
}))

app.use('/api', asyncRoute(async (req, res, next) => {
  req.admin = await getSession(req)
  if (!req.admin) return res.status(401).json({ error: 'Please sign in' })
  next()
}))

app.get('/api/auth/me', (req, res) => res.json({ email: req.admin.email }))
app.post('/api/auth/logout', asyncRoute(async (req, res) => {
  await deleteSession(req)
  res.set('Set-Cookie', clearSessionCookie()).status(204).end()
}))

app.get('/api/organisation', asyncRoute(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM organisations WHERE id = $1', [req.admin.organisation_id])
  res.json(organisationDto(rows[0]))
}))

app.put('/api/organisation', asyncRoute(async (req, res) => {
  const input = req.body || {}
  if (input.urnDate && !dateOnly(input.urnDate)) return res.status(400).json({ error: 'Invalid URN issue date' })
  const values = [text(input.name, 200), text(input.pan, 10).toUpperCase(), text(input.address, 1000), text(input.urn, 200), input.urnDate || null, text(input.email, 320), text(input.phone, 50), text(input.signatory, 200), text(input.designation, 200), req.admin.organisation_id]
  const { rows } = await pool.query(`UPDATE organisations SET name=$1, pan=$2, address=$3, urn=$4, urn_date=$5, email=$6, phone=$7, signatory=$8, designation=$9, updated_at=now() WHERE id=$10 RETURNING *`, values)
  res.json(organisationDto(rows[0]))
}))

app.get('/api/receipts', asyncRoute(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM receipts WHERE organisation_id = $1 ORDER BY created_at DESC LIMIT 500', [req.admin.organisation_id])
  res.json(rows.map(receiptDto))
}))

app.post('/api/receipts', asyncRoute(async (req, res) => {
  const input = req.body || {}
  const amount = Number(input.amount)
  const validAmount = /^\d+(?:\.\d{1,2})?$/.test(String(input.amount ?? '')) && Number.isFinite(amount) && amount >= 0.01 && amount <= 999999999999.99
  if (!text(input.donorName, 200) || !text(input.donorId, 100) || !text(input.donorAddress, 1000) || !dateOnly(input.date) || !validAmount) return res.status(400).json({ error: 'Enter complete donor details and an amount of at least ₹0.01, with no more than two decimal places' })
  if (!['PAN', 'Aadhaar', 'Other'].includes(input.donorIdType) || !['UPI', 'Bank transfer', 'Cheque', 'Demand draft', 'Cash', 'Card', 'Other'].includes(input.mode) || !['Others', 'Corpus', 'Specific grants'].includes(input.type)) return res.status(400).json({ error: 'Invalid donation option' })
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const orgResult = await client.query('SELECT * FROM organisations WHERE id = $1 FOR UPDATE', [req.admin.organisation_id])
    const org = orgResult.rows[0]
    if (!org.name || !org.pan || !org.address || !org.urn || !org.urn_date) {
      await client.query('ROLLBACK')
      return res.status(400).json({ error: 'Complete the organisation details before generating a receipt' })
    }
    const generatedNo = `DR-${new Date().getFullYear()}-${String(org.next_receipt_number).padStart(4, '0')}`
    const receiptNo = text(input.receiptNo, 100) || generatedNo
    const { rows } = await client.query(`INSERT INTO receipts (organisation_id, created_by, receipt_no, donor_name, donor_id_type, donor_id, donor_address, donor_email, amount, donation_date, payment_mode, reference, donation_type, purpose, organisation_snapshot)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`, [
      req.admin.organisation_id, req.admin.admin_id, receiptNo,
      text(input.donorName, 200), input.donorIdType, text(input.donorId, 100), text(input.donorAddress, 1000), text(input.donorEmail, 320), amount, input.date, input.mode, text(input.reference, 200), input.type, text(input.purpose, 500), JSON.stringify(organisationDto(org)),
    ])
    await client.query('UPDATE organisations SET next_receipt_number = next_receipt_number + 1 WHERE id = $1', [req.admin.organisation_id])
    await client.query('COMMIT')
    res.status(201).json(receiptDto(rows[0]))
  } catch (error) {
    await client.query('ROLLBACK')
    if (error.code === '23505') return res.status(409).json({ error: 'Receipt number already exists' })
    throw error
  } finally { client.release() }
}))

const dist = resolve('dist')
app.use(express.static(dist))
app.get('/{*path}', (_req, res) => res.sendFile(resolve(dist, 'index.html')))
app.use((error, _req, res, _next) => {
  console.error(error)
  res.status(500).json({ error: 'Server error' })
})

const port = Number(process.env.PORT || 8080)
app.listen(port, '0.0.0.0', () => console.log(`NGO Receipt Generator API listening on ${port}`))
