import { ArrowRight, Heart, ShieldCheck } from 'lucide-react'
import FormField from '../../components/FormField.jsx'
import PageHeader from '../../components/PageHeader.jsx'

export default function OrganisationPage({ organisation, onChange, onContinue, error, busy }) {
  const field = (label, name, options = {}) => <FormField label={label} name={name} value={organisation[name]} onChange={onChange} {...options} />
  return <>
    <PageHeader eyebrow="WORKSPACE SETTINGS" title="Organisation details" description="These details appear on every receipt. Enter them exactly as registered." />
    {error && <div className="alert">{error}</div>}
    <div className="form-card"><div className="card-title"><div className="card-icon"><Heart size={19} /></div><div><h3>NGO information</h3><p>Official registration and contact details</p></div></div>
      <div className="form-grid">
        {field('Organisation name', 'name', { required: true, wide: true, placeholder: 'Registered NGO name' })}
        {field('PAN', 'pan', { required: true, placeholder: 'ABCDE1234F' })}
        {field('80G Unique Registration Number (URN)', 'urn', { required: true, placeholder: 'Enter approval URN' })}
        {field('URN issue date', 'urnDate', { type: 'date', required: true })}
        {field('Email', 'email', { type: 'email', placeholder: 'hello@ngo.org' })}
        {field('Phone', 'phone', { type: 'tel', placeholder: '+91 98765 43210' })}
        {field('Registered address', 'address', { required: true, wide: true, placeholder: 'Full postal address' })}
        {field('Authorised signatory', 'signatory', { placeholder: 'Full name' })}
        {field('Designation', 'designation', { placeholder: 'Treasurer / Director' })}
      </div><div className="form-actions"><button className="primary" onClick={onContinue} disabled={busy}>{busy ? 'Saving…' : 'Save and continue'} <ArrowRight size={18} /></button></div>
    </div>
    <div className="info-box"><ShieldCheck size={19} /><p>Use your actual registration and approval details. A receipt does not replace Form 10BE where that certificate is required.</p></div>
  </>
}
