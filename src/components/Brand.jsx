import { Heart } from 'lucide-react'

export default function Brand({ className = '' }) {
  return <div className={`brand ${className}`}><span className="brand-icon"><Heart size={21} fill="currentColor" /></span><span>NGO Receipt Generator</span></div>
}
