const baseUrl = import.meta.env.VITE_API_URL || ''

async function request(path, options = {}) {
  let response
  try {
    response = await fetch(`${baseUrl}/api${path}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      ...options,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    })
  } catch {
    throw new Error('Cannot connect to the API. Start the backend and try again.')
  }
  if (!response.ok) {
    const result = await response.json().catch(() => ({}))
    throw new Error(result.error || 'Request failed')
  }
  return response.status === 204 ? null : response.json()
}

export const api = {
  me: () => request('/auth/me'),
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
  register: (organisationName, email, password) => request('/auth/register', { method: 'POST', body: { organisationName, email, password } }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  getOrganisation: () => request('/organisation'),
  saveOrganisation: organisation => request('/organisation', { method: 'PUT', body: organisation }),
  listReceipts: () => request('/receipts'),
  createReceipt: receipt => request('/receipts', { method: 'POST', body: receipt }),
}
