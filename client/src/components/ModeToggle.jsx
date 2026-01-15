function ModeToggle({ mode, setMode }) {
  return (
    <div className="mode-toggle-container">
      <div className="mode-toggle">
        <button
          onClick={() => setMode('vulnerable')}
          className={`mode-button ${mode === 'vulnerable' ? 'active' : ''}`}
        >
          <span>⚠️</span>
          <span>Vulnerable</span>
        </button>
        
        <button
          onClick={() => setMode('secure')}
          className={`mode-button ${mode === 'secure' ? 'active' : ''}`}
        >
          <span>🔒</span>
          <span>Secure</span>
        </button>
      </div>
    </div>
  )
}

export default ModeToggle

