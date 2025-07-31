import React from 'react';

function DebugComponent() {
  console.log('🎯 DebugComponent rendering...');
  
  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: '#4CAF50',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      zIndex: 9999,
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif'
    }}>
      ✅ React is Working!
      <br />
      Time: {new Date().toLocaleTimeString()}
    </div>
  );
}

export default DebugComponent;
