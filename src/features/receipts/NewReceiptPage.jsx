import { CircleHelp, FileText } from 'lucide-react'
import FormField from '../../components/FormField.jsx'
import PageHeader from '../../components/PageHeader.jsx'

export default function NewReceiptPage({ receipt, onChange, onClear, onGenerate, error, busy }) {
  const field = (label, name, options = {}) => <FormField label={label} name={name} value={receipt[name]} onChange={onChange} {...options} />
  return <>
    <PageHeader eyebrow="NEW DONATION" title="Create a receipt" description="Capture the gift details. A print-ready receipt is one step away." />
    {error && <div className="alert">{error}</div>}
    <form onSubmit={onGenerate}>
      <div className="form-card"><div className="card-title"><div className="card-icon"><FileText size={19} /></div><div><h3>Donor details</h3><p>Who made this contribution?</p></div></div><div className="form-grid">
        {field('Donor name', 'donorName', { required: true, placeholder: 'Full name' })}
        {field('Email address', 'donorEmail', { type: 'email', placeholder: 'donor@example.com' })}
        {field('Identification type', 'donorIdType', { options: ['PAN', 'Aadhaar', 'Other'] })}
        {field('Identification number', 'donorId', { required: true, placeholder: 'Enter ID number' })}
        {field('Donor address', 'donorAddress', { required: true, wide: true, placeholder: 'Full postal address' })}
      </div></div>
      <div className="form-card"><div className="card-title"><div className="card-icon mint"><FileText size={19} /></div><div><h3>Donation details</h3><p>How and when was the donation received?</p></div></div><div className="form-grid">
        {field('Amount (₹)', 'amount', { type: 'number', min: '0.01', step: '0.01', required: true, placeholder: '0.00' })}
        {field('Donation date', 'date', { type: 'date', required: true })}
        {field('Payment mode', 'mode', { options: ['UPI', 'Bank transfer', 'Cheque', 'Demand draft', 'Cash', 'Card', 'Other'] })}
        {field('Transaction reference', 'reference', { placeholder: 'UTR / cheque number' })}
        {field('Donation type', 'type', { options: ['Others', 'Corpus', 'Specific grants'] })}
        {field('Receipt number (optional)', 'receiptNo', { placeholder: 'Auto-generated if blank' })}
        {field('Purpose / campaign', 'purpose', { wide: true, placeholder: 'Optional description' })}
      </div><div className="form-actions"><button className="secondary" type="button" onClick={onClear}>Clear form</button><button className="primary" type="submit" disabled={busy}><FileText size={18} /> {busy ? 'Saving…' : 'Generate receipt'}</button></div></div>
    </form>
    <div className="info-box"><CircleHelp size={19} /><p>For eligible 80G claims, verify the NGO’s approval and file Form 10BD. Issue the portal-generated Form 10BE separately where applicable.</p></div>
  </>
}
