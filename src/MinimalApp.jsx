import React from 'react';

function MinimalApp() {
  console.log('MinimalApp is rendering...');
  
  return React.createElement('div', {
    style: {
      padding: '20px',
      backgroundColor: '#f0f0f0',
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#333'
    }
  }, [
    React.createElement('h1', { key: 'title', style: { color: 'red' } }, '🚀 REACT IS WORKING!'),
    React.createElement('p', { key: 'msg' }, 'If you see this, the white page issue is resolved.'),
    React.createElement('p', { key: 'time' }, `Current time: ${new Date().toLocaleString()}`)
  ]);
}

export default MinimalApp;