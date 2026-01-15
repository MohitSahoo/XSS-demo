import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import ReflectedXSS from './pages/ReflectedXSS'
import StoredXSS from './pages/StoredXSS'
import DOMXSS from './pages/DOMXSS'
import Dashboard from './pages/Dashboard'
import ModeToggle from './components/ModeToggle'
import { setSecurityMode } from './utils/axiosConfig'

function AppContent() {
  const [mode, setMode] = useState('vulnerable')
  const location = useLocation()
  
  useEffect(() => {
    setSecurityMode(mode)
  }, [mode])

  const themeClass = mode === 'secure' ? 'theme-secure' : 'theme-vulnerable'

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/reflected', label: 'Reflected XSS', icon: '🔄' },
    { path: '/stored', label: 'Stored XSS', icon: '💾' },
    { path: '/dom', label: 'DOM-Based XSS', icon: '🌐' }
  ]

  return (
    <div className={`app-container ${themeClass}`}>
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="header-title-section">
            <h1 className="header-title">
              🔒 XSS Security Assessment Platform
            </h1>
            <p className="header-subtitle">
              Enterprise-Grade Security Testing Environment
            </p>
          </div>
          <ModeToggle mode={mode} setMode={setMode} />
        </div>
      </header>

      {/* Navigation */}
      <nav className="app-nav">
        <div className="nav-container">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${isActive ? 'active' : ''}`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard mode={mode} />} />
          <Route path="/reflected" element={<ReflectedXSS mode={mode} />} />
          <Route path="/stored" element={<StoredXSS mode={mode} />} />
          <Route path="/dom" element={<DOMXSS mode={mode} />} />
          <Route path="/dom/*" element={<DOMXSS mode={mode} />} />
          {/* Catch-all route for any unmatched paths */}
          <Route path="*" element={<Dashboard mode={mode} />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App

