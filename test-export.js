// Simple test to check if ABCDBCDNumber.jsx can be imported
import React from 'react';

// Try importing the component
try {
  const ABCDBCDNumber = require('./src/components/ABCDBCDNumber.jsx');
  console.log('✅ ABCDBCDNumber default export exists:', typeof ABCDBCDNumber.default);
  console.log('✅ ABCDBCDNumber named exports:', Object.keys(ABCDBCDNumber));
} catch (error) {
  console.log('❌ Error importing ABCDBCDNumber:', error.message);
}

// Try importing the clean version
try {
  const ABCDBCDNumberClean = require('./src/components/ABCDBCDNumber_clean.jsx');
  console.log('✅ ABCDBCDNumber_clean default export exists:', typeof ABCDBCDNumberClean.default);
  console.log('✅ ABCDBCDNumber_clean named exports:', Object.keys(ABCDBCDNumberClean));
} catch (error) {
  console.log('❌ Error importing ABCDBCDNumber_clean:', error.message);
}
