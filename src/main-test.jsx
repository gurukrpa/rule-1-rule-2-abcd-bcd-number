import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

function SimpleApp() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#333' }}>🚀 Server is Working!</h1>
      <p style={{ color: '#666' }}>This is a minimal React app to test if the server is responding.</p>
      <div style={{ 
        background: '#f0f8ff', 
        padding: '15px', 
        borderRadius: '8px',
        border: '2px solid #4CAF50'
      }}>
        <p style={{ margin: 0, color: '#4CAF50', fontWeight: 'bold' }}>
          ✅ CSS and JavaScript are working!
        </p>
      </div>
      <p>Timestamp: {new Date().toISOString()}</p>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SimpleApp />
  </React.StrictMode>
)
