import { useEffect, useState } from 'react'
import { api } from './api/client.js'
import LoginPage from './features/auth/LoginPage.jsx'
import DashboardPage from './features/dashboard/DashboardPage.jsx'
import OrganisationPage from './features/organisation/OrganisationPage.jsx'
import NewReceiptPage from './features/receipts/NewReceiptPage.jsx'
import ReceiptListPage from './features/receipts/ReceiptListPage.jsx'
import ReceiptPreview from './features/receipts/ReceiptPreview.jsx'
import AppShell from './layout/AppShell.jsx'
import { createInitialOrganisation, createInitialReceipt } from './data/defaults.js'

export default function App() {
  const [checkingSession, setCheckingSession] = useState(true)
  const [signedIn, setSignedIn] = useState(false)
  const [busy, setBusy] = useState(false)
  const [page, setPage] = useState('dashboard')
  const [organisation, setOrganisation] = useState(createInitialOrganisation)
  const [receipt, setReceipt] = useState(createInitialReceipt)
  const [receipts, setReceipts] = useState([])
  const [previewReceipt, setPreviewReceipt] = useState(null)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  async function loadWorkspace() {
    const [savedOrganisation, savedReceipts] = await Promise.all([api.getOrganisation(), api.listReceipts()])
    setOrganisation(savedOrganisation)
    setReceipts(savedReceipts)
  }

  useEffect(() => {
    api.me().then(async () => { await loadWorkspace(); setSignedIn(true) }).catch(() => {}).finally(() => setCheckingSession(false))
  }, [])

  const updateOrganisation = (name, value) => setOrganisation(current => ({ ...current, [name]: value }))
  const updateReceipt = (name, value) => setReceipt(current => ({ ...current, [name]: value }))
  const navigate = nextPage => { setPage(nextPage); setMenuOpen(false); setError('') }

  async function signIn(email, password) {
    setBusy(true)
    setError('')
    try {
      await api.login(email, password)
      await loadWorkspace()
      setSignedIn(true)
    } catch (problem) { setError(problem.message) }
    finally { setBusy(false) }
  }

  async function register(organisationName, email, password) {
    setBusy(true)
    setError('')
    try {
      await api.register(organisationName, email, password)
      await loadWorkspace()
      setPage('settings')
      setSignedIn(true)
    } catch (problem) { setError(problem.message) }
    finally { setBusy(false) }
  }

  async function signOut() {
    try { await api.logout() } catch { /* Expired sessions are signed out locally. */ }
    setSignedIn(false)
    setOrganisation(createInitialOrganisation())
    setReceipts([])
    setReceipt(createInitialReceipt())
    setMenuOpen(false)
  }

  async function saveOrganisation() {
    setBusy(true)
    setError('')
    try {
      const saved = await api.saveOrganisation(organisation)
      setOrganisation(saved)
      navigate('new')
    } catch (problem) { setError(problem.message) }
    finally { setBusy(false) }
  }

  async function generateReceipt(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const created = await api.createReceipt(receipt)
      setReceipts(current => [created, ...current])
      setReceipt(createInitialReceipt())
      setPreviewReceipt(created)
      if (created.mode === 'Cash' && Number(created.amount) > 2000) {
        setError('Cash donations above ₹2,000 are generally not eligible for an 80G deduction. The receipt can still be issued without a deduction claim.')
      }
    } catch (problem) {
      setError(problem.message)
      if (problem.message.includes('organisation details')) setPage('settings')
    } finally { setBusy(false) }
  }

  if (checkingSession) return <div className="startup-loading">Loading NGO Receipt Generator…</div>
  if (!signedIn) return <LoginPage onSignIn={signIn} onRegister={register} onModeChange={() => setError('')} error={error} loading={busy} />

  return <>
    <AppShell page={page} onNavigate={navigate} onSignOut={signOut} menuOpen={menuOpen} onToggleMenu={() => setMenuOpen(current => !current)}>
      {page === 'dashboard' && <DashboardPage organisation={organisation} receipts={receipts} onNavigate={navigate} onPreview={setPreviewReceipt} />}
      {page === 'settings' && <OrganisationPage organisation={organisation} onChange={updateOrganisation} onContinue={saveOrganisation} error={error} busy={busy} />}
      {page === 'new' && <NewReceiptPage receipt={receipt} onChange={updateReceipt} onClear={() => setReceipt(createInitialReceipt())} onGenerate={generateReceipt} error={error} busy={busy} />}
      {page === 'receipts' && <ReceiptListPage receipts={receipts} search={search} onSearch={setSearch} onNavigate={navigate} onPreview={setPreviewReceipt} />}
    </AppShell>
    {previewReceipt && <ReceiptPreview organisation={previewReceipt.organisationSnapshot || organisation} receipt={previewReceipt} onClose={() => setPreviewReceipt(null)} />}
  </>
}
