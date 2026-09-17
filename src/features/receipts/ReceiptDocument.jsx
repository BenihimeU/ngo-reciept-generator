import { Heart } from 'lucide-react'
import { dateLabel, financialYear, money } from '../../utils/format.js'

export default function ReceiptDocument({ organisation, receipt }) {
  return <div className="receipt-paper" id="receipt-print">
    <div className="receipt-top"><div className="receipt-mark"><Heart size={21} fill="currentColor" /></div><div><div className="receipt-org">{organisation.name || 'Your organisation name'}</div><div className="receipt-org-sub">{organisation.address || 'Organisation address'}</div></div><div className="receipt-title">DONATION<br />RECEIPT</div></div>
    <div className="receipt-rule" />
    <div className="receipt-meta"><div><small>RECEIPT NO.</small><strong>{receipt.receiptNo || '—'}</strong></div><div><small>DATE OF DONATION</small><strong>{dateLabel(receipt.date)}</strong></div><div><small>FINANCIAL YEAR</small><strong>{financialYear(receipt.date)}</strong></div></div>
    <div className="receipt-section"><small>RECEIVED WITH GRATITUDE FROM</small><h2>{receipt.donorName || 'Donor name'}</h2><p>{receipt.donorAddress || 'Donor address'}</p>{receipt.donorId && <p>{receipt.donorIdType}: {receipt.donorId}</p>}</div>
    <div className="amount-box"><div><small>AMOUNT RECEIVED</small><strong>{money(receipt.amount)}</strong></div><div><small>PAYMENT MODE</small><strong>{receipt.mode}</strong></div></div>
    <div className="receipt-details"><div><span>Transaction reference</span><strong>{receipt.reference || '—'}</strong></div><div><span>Donation type</span><strong>{receipt.type}</strong></div><div><span>Purpose</span><strong>{receipt.purpose || 'General donation'}</strong></div></div>
    <div className="receipt-ngo"><div><small>ORGANISATION DETAILS</small><p>PAN: <strong>{organisation.pan || '—'}</strong></p><p>80G URN: <strong>{organisation.urn || '—'}</strong></p><p>URN issue date: <strong>{dateLabel(organisation.urnDate)}</strong></p></div><div className="signature"><div className="sign-line" /><strong>{organisation.signatory || 'Authorised signatory'}</strong><span>{organisation.designation || 'For the organisation'}</span></div></div>
    <div className="receipt-foot">Thank you for supporting our work.<br /><span>This is a donation receipt, not Form 10BE. Where applicable, the official Form 10BE must be issued after Form 10BD filing through the Income Tax portal.</span></div>
  </div>
}
