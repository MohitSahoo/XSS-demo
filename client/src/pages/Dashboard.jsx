import { useState, useEffect } from 'react'
import api from '../utils/axiosConfig'

function Dashboard({ mode }) {
  const [exploitLogs, setExploitLogs] = useState([])
  const [attackerData, setAttackerData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLogs()
    fetchAttackerData()
    const interval = setInterval(() => {
      fetchLogs()
      fetchAttackerData()
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const fetchLogs = async () => {
    try {
      const response = await api.get('/exploits/logs')
      setExploitLogs(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching logs:', error)
      setLoading(false)
    }
  }

  const fetchAttackerData = async () => {
    try {
      const response = await api.get('/attacker/data')
      setAttackerData(response.data)
    } catch (error) {
      console.error('Error fetching attacker data:', error)
    }
  }

  if (loading) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">⏳</div>
        <div className="empty-state-text">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="content-section">
      {/* Header Card */}
      <div className="glass-card">
        <div className="section-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 className="section-title">Security Assessment Dashboard</h1>
              <p className="section-subtitle">Real-time monitoring of XSS vulnerabilities and exploits</p>
            </div>
            <span className="badge">
              {mode === 'vulnerable' ? '⚠️ VULNERABLE MODE' : '🔒 SECURE MODE'}
            </span>
          </div>
        </div>
        
        <div className="alert-box">
          <h3 className="alert-title">⚠️ Educational Purpose Only</h3>
          <div className="alert-content">
            <p>
              This platform demonstrates XSS vulnerabilities and their fixes for educational purposes.
              All vulnerabilities are intentionally implemented to show real-world attack scenarios.
              Use responsibly and only in controlled environments.
            </p>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-info">
                <h3>Exploit Attempts</h3>
                <div className="stat-value">{exploitLogs.length}</div>
              </div>
              <div className="stat-icon">🎯</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-info">
                <h3>Stolen Data Entries</h3>
                <div className="stat-value">{attackerData.length}</div>
              </div>
              <div className="stat-icon">🔓</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-info">
                <h3>Security Mode</h3>
                <div className="stat-value" style={{ fontSize: '1.5rem' }}>
                  {mode === 'secure' ? 'Protected' : 'Exposed'}
                </div>
              </div>
              <div className="stat-icon">{mode === 'secure' ? '🛡️' : '⚠️'}</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-info">
                <h3>Status</h3>
                <div className="stat-value" style={{ fontSize: '1.5rem' }}>Active</div>
              </div>
              <div className="stat-icon">🟢</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Exploit Logs */}
      <div className="glass-card">
        <div className="section-header">
          <h2 className="section-title">Recent Exploit Logs</h2>
          <p className="section-subtitle">Live monitoring of XSS attack attempts</p>
        </div>
        
        <div className="logs-panel">
          {exploitLogs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📝</div>
              <p className="empty-state-text">No exploit attempts logged yet.</p>
              <p className="empty-state-subtext">Try testing the XSS vulnerabilities to see logs appear here.</p>
            </div>
          ) : (
            exploitLogs.slice(0, 10).map((log, idx) => (
              <div key={idx} className="log-entry">
                <div className="log-header">
                  <span className="log-time">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="log-type">{log.type}</span>
                </div>
                <div className="log-content">{log.payload}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Attacker Dashboard */}
      <div className="glass-card">
        <div className="section-header">
          <h2 className="section-title">Attacker Dashboard (Stolen Data)</h2>
          <p className="section-subtitle">Data exfiltrated through successful XSS attacks</p>
        </div>
        
        <div className="logs-panel">
          {attackerData.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔒</div>
              <p className="empty-state-text">No data stolen yet.</p>
              <p className="empty-state-subtext">Try exploiting the vulnerabilities to see stolen data appear here!</p>
            </div>
          ) : (
            attackerData.slice(0, 10).map((entry, idx) => (
              <div key={idx} className="log-entry">
                <div className="log-header">
                  <span className="log-time">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="log-type">{entry.type}</span>
                </div>
                <div className="log-content">{entry.data}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard

