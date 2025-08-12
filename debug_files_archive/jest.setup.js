const { setupJestDom } = require('@testing-library/jest-dom');

// Mock import.meta.env for tests
global.importMeta = {
  env: {
    VITE_ENABLE_LOTTERY_SYNC: 'true',
    VITE_DEBUG_LOTTERY_SYNC: 'true'
  }
};
