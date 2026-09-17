import { Printer, X } from 'lucide-react'
import ReceiptDocument from './ReceiptDocument.jsx'

export default function ReceiptPreview({ organisation, receipt, onClose }) {
  return <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
    <div className="preview-modal">
      <div className="modal-head"><div><span className="eyebrow">READY TO SHARE</span><h2>Donation receipt</h2></div><button className="icon-button" onClick={onClose} aria-label="Close"><X size={22} /></button></div>
      <div className="preview-scroll"><ReceiptDocument organisation={organisation} receipt={receipt} /></div>
      <div className="modal-actions"><span>Print or save as PDF using your browser.</span><button className="primary" onClick={() => window.print()}><Printer size={18} /> Print / Save PDF</button></div>
    </div>
  </div>
}
