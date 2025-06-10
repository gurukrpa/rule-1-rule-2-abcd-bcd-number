import React from 'react';
import ABCDBCDNumber from './ABCDBCDNumber';

function ABCDBCDNumberWrapper() {
  console.log('ABCDBCDNumberWrapper component rendering...');
  
  try {
    return (
      <div>
        <h1>Debug: Wrapper Component Loaded</h1>
        <ABCDBCDNumber />
      </div>
    );
  } catch (error) {
    console.error('Error in ABCDBCDNumberWrapper:', error);
    return (
      <div style={{ padding: '20px', background: '#ffebee', color: '#c62828' }}>
        <h1>Error loading ABCDBCDNumber component</h1>
        <p>{error.message}</p>
        <pre>{error.stack}</pre>
      </div>
    );
  }
}

export default ABCDBCDNumberWrapper;
