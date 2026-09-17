import { ArrowRight, CircleHelp, FileText, LayoutDashboard, LogOut, Menu, Plus, Settings } from 'lucide-react'
import Brand from '../components/Brand.jsx'

const links = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'new', label: 'New receipt', icon: Plus },
  { id: 'receipts', label: 'Receipts', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export default function AppShell({ page, onNavigate, onSignOut, menuOpen, onToggleMenu, children }) {
  const pageName = links.find(link => link.id === page)?.label || 'Dashboard'
  return <div className="app-shell">
    <aside className={`sidebar ${menuOpen ? 'show' : ''}`}>
      <Brand />
      <div className="workspace-label">WORKSPACE</div>
      <nav>{links.map(({ id, label, icon: Icon }) => <button key={id} className={`nav-item ${page === id ? 'active' : ''}`} onClick={() => onNavigate(id)}><Icon size={19} /><span>{label}</span></button>)}</nav>
      <div className="sidebar-bottom">
        <div className="help-card"><div className="help-icon"><CircleHelp size={19} /></div><strong>Need a hand?</strong><p>Check the compliance notes before issuing a receipt.</p><a href="https://www.incometax.gov.in/iec/foportal/help/statutory-forms/popular-form/form10bd-10be" target="_blank" rel="noreferrer">View official guide <ArrowRight size={14} /></a></div>
        <button className="signout" onClick={onSignOut}><LogOut size={18} /> Sign out</button>
      </div>
    </aside>
    <div className="main-wrap"><header className="topbar">
      <button className="mobile-menu" onClick={onToggleMenu} aria-label="Toggle menu"><Menu size={22} /></button>
      <div className="breadcrumb">Workspace <span>/</span> <strong>{pageName}</strong></div>
      <div className="top-actions"><span className="demo-pill"><span /> Admin workspace</span><div className="avatar">A</div></div>
    </header><main className="main-content">{children}</main></div>
  </div>
}
