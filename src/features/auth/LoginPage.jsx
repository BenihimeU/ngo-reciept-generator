import { useState } from 'react'
import { ArrowRight, Heart, ShieldCheck } from 'lucide-react'
import Brand from '../../components/Brand.jsx'

export default function LoginPage({ onSignIn, onRegister, onModeChange, error, loading }) {
  const [registering, setRegistering] = useState(false)
  const [organisationName, setOrganisationName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [formError, setFormError] = useState('')
  const submit = event => {
    event.preventDefault()
    setFormError('')
    if (registering) {
      if (password !== confirmation) return setFormError('Passwords do not match')
      onRegister(organisationName, email, password)
    } else onSignIn(email, password)
  }
  const toggleMode = () => { setRegistering(current => !current); setFormError(''); onModeChange() }

  return <div className="login-shell">
    <div className="login-brand">
      <Brand />
      <div className="login-message"><span className="eyebrow light">MADE FOR THE GOOD YOU DO</span><h1>Every act of giving deserves to be remembered.</h1><p>A simple, thoughtful workspace for your donation receipts.</p></div>
      <div className="login-art"><div className="art-card"><span className="art-heart"><Heart size={25} fill="currentColor" /></span><span><strong>Make every contribution count</strong><small>Clear records. Grateful donors. More impact.</small></span></div></div>
      <div className="brand-footer">Donation receipt workspace for Indian NGOs</div>
    </div>
    <div className="login-form-wrap"><div className="login-form">
      <Brand className="mobile-brand" />
      <span className="eyebrow">{registering ? 'GET STARTED' : 'WELCOME BACK'}</span><h2>{registering ? 'Create your NGO workspace' : 'Sign in to your workspace'}</h2><p>{registering ? 'Register the first admin account for your organisation.' : 'Create receipts and keep your giving records together.'}</p>
      {(error || formError) && <div className="alert">{formError || error}</div>}
      <form onSubmit={submit}>
        {registering && <label className="field"><span>Organisation name</span><input required maxLength={200} placeholder="Registered NGO name" value={organisationName} onChange={event => setOrganisationName(event.target.value)} /></label>}
        <label className="field"><span>Admin email</span><input type="email" required placeholder="admin@yourngo.org" value={email} onChange={event => setEmail(event.target.value)} /></label>
        <label className="field"><span>Password</span><input type="password" required minLength={registering ? 12 : undefined} maxLength={256} placeholder={registering ? 'At least 12 characters' : 'Enter your password'} value={password} onChange={event => setPassword(event.target.value)} /></label>
        {registering && <label className="field"><span>Confirm password</span><input type="password" required placeholder="Repeat your password" value={confirmation} onChange={event => setConfirmation(event.target.value)} /></label>}
        <button className="primary full" type="submit" disabled={loading}>{loading ? 'Please wait…' : registering ? 'Create account' : 'Continue to dashboard'} <ArrowRight size={18} /></button>
      </form>
      <button type="button" className="auth-switch" onClick={toggleMode}>{registering ? 'Already have an account? Sign in' : 'New NGO? Create an account'}</button>
      <div className="demo-note"><ShieldCheck size={18} /><span><strong>Admin access</strong><br />{registering ? 'You will be the first admin for this workspace. Complete the 80G details after registration.' : 'Sign in with your registered admin email and password.'}</span></div>
    </div></div>
  </div>
}
