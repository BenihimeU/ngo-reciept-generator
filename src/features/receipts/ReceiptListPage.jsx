import { ArrowRight, FileText, Plus, Search } from 'lucide-react'
import PageHeader from '../../components/PageHeader.jsx'
import { dateLabel, money } from '../../utils/format.js'

export default function ReceiptListPage({ receipts, search, onSearch, onNavigate, onPreview }) {
  const matching = receipts.filter(receipt => `${receipt.donorName} ${receipt.receiptNo}`.toLowerCase().includes(search.toLowerCase()))
  return <>
    <PageHeader eyebrow="YOUR RECORDS" title="Donation receipts" description="Review your saved donation receipts." action={<button className="primary" onClick={() => onNavigate('new')}><Plus size={18} /> New receipt</button>} />
    <div className="search-box"><Search size={19} /><input placeholder="Search by donor or receipt number" value={search} onChange={event => onSearch(event.target.value)} /></div>
    {matching.length ? <div className="record-list">{matching.map(receipt => <button key={receipt.id} className="record-row" onClick={() => onPreview(receipt)}><span className="record-avatar">{receipt.donorName[0]}</span><span><strong>{receipt.donorName}</strong><small>{receipt.receiptNo} · {dateLabel(receipt.date)}</small></span><b>{money(receipt.amount)}</b><ArrowRight size={17} /></button>)}</div> : <div className="empty"><div className="empty-icon"><FileText size={26} /></div><strong>No matching receipts</strong><p>Saved receipts will show here.</p></div>}
  </>
}
