import React from 'react';

function TestApp() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: 'green' }}>✅ React App is Working!</h1>
      <p>If you can see this, React is loading correctly.</p>
      <p>Current time: {new Date().toLocaleString()}</p>
    </div>
  );
}

export default TestApp;