import { randomUUID } from 'node:crypto'
import { pool } from '../db.js'

const base = process.env.API_URL || 'http://127.0.0.1:8080'
const email = `smoke-${randomUUID()}@example.test`
const password = `Test-${randomUUID()}-password`
let organisationId
let adminId
let cookie

async function call(path, method = 'GET', body) {
  const response = await fetch(`${base}/api${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:8080', ...(cookie ? { Cookie: cookie } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = response.status === 204 ? null : await response.json()
  return { response, data }
}

try {
  const registered = await call('/auth/register', 'POST', { organisationName: 'Smoke Test NGO', email, password })
  if (registered.response.status !== 201) throw new Error(`Registration failed: ${JSON.stringify(registered.data)}`)
  cookie = registered.response.headers.get('set-cookie')?.split(';')[0]
  if (!cookie) throw new Error('Session cookie missing')
  const ids = await pool.query('SELECT admins.id AS admin_id, organisation_id FROM admins WHERE email=$1', [email])
  adminId = ids.rows[0].admin_id
  organisationId = ids.rows[0].organisation_id

  const duplicate = await call('/auth/register', 'POST', { organisationName: 'Other NGO', email, password })
  if (duplicate.response.status !== 409) throw new Error('Duplicate email was accepted')
  const me = await call('/auth/me')
  if (me.data.email !== email) throw new Error(`Session lookup failed: ${me.response.status} ${JSON.stringify(me.data)}`)

  const savedOrg = await call('/organisation', 'PUT', {
    name: 'Smoke Test NGO', pan: 'ABCDE1234F', address: '123 Test Street',
    urn: 'URN-TEST-1', urnDate: '2024-04-01', email: '', phone: '', signatory: 'Test Admin', designation: 'Trustee',
  })
  if (savedOrg.response.status !== 200) throw new Error(`Organisation save failed: ${JSON.stringify(savedOrg.data)}`)

  const receipt = await call('/receipts', 'POST', {
    donorName: 'Test Donor', donorIdType: 'PAN', donorId: 'ABCDE1234F',
    donorAddress: 'Test Address', donorEmail: '', amount: '100.00', date: '2026-09-17',
    mode: 'UPI', reference: 'TEST-UTR', type: 'Others', purpose: 'Smoke test', receiptNo: '',
  })
  if (receipt.response.status !== 201 || !receipt.data.receiptNo) throw new Error(`Receipt creation failed: ${JSON.stringify(receipt.data)}`)
  const listed = await call('/receipts')
  if (!listed.data.some(item => item.id === receipt.data.id)) throw new Error('Receipt list failed')
  const logout = await call('/auth/logout', 'POST')
  if (logout.response.status !== 204) throw new Error('Logout failed')
  const afterLogout = await call('/auth/me')
  if (afterLogout.response.status !== 401) throw new Error('Expired session still worked')
  console.log('Registration, duplicate protection, session, organisation, receipt, and logout checks passed')
} finally {
  if (organisationId) {
    await pool.query('DELETE FROM receipts WHERE organisation_id=$1', [organisationId])
    await pool.query('DELETE FROM sessions WHERE admin_id=$1', [adminId])
    await pool.query('DELETE FROM admins WHERE id=$1', [adminId])
    await pool.query('DELETE FROM organisations WHERE id=$1', [organisationId])
  }
  await pool.end()
}
