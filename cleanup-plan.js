// Comprehensive Cleanup Plan for Clean Application
// This script will remove all test, demo, debug, and diagnostic files

const filesToRemove = [
  // Debug files
  'debug-*.js',
  'debug-*.html',
  'debug-*.mjs',
  '*debug*.js',
  '*debug*.html',
  
  // Test files
  'test-*.js',
  'test-*.html',
  'test-*.mjs',
  '*test*.js',
  '*test*.html',
  
  // Diagnostic files
  'diagnostic-*.js',
  'diagnostic-*.html',
  '*diagnostic*.js',
  '*diagnostic*.html',
  'diagnose-*.js',
  'instant-diagnostic.js',
  'one-line-diagnostic.js',
  
  // Demo files
  'demo-*.js',
  'demo-*.html',
  '*demo*.js',
  '*demo*.html',
  
  // Recovery/backup/fix files
  'data-recovery-*.js',
  'data-recovery-*.html',
  'dates-recovery-*.js',
  'recovery-*.js',
  'backup-*.js',
  'fix-*.js',
  'auto-fix-*.js',
  'auto-fix-*.html',
  'immediate-*.js',
  'instant-*.js',
  'quick-*.js',
  'apply-*.js',
  'apply-*.mjs',
  
  // Verification files
  'verify-*.js',
  'validate-*.js',
  'check-*.js',
  'comprehensive-*.js',
  'complete-*.js',
  
  // Migration/cleanup files
  'migrate-*.html',
  'migration-*.js',
  'cleanup-*.js',
  'cleanup-*.sh',
  'cleanup_*.sh',
  'cleaner-*.js',
  'cleaner-*.html',
  'clean-*.sql',
  'clear-*.js',
  'clear-*.html',
  'clear-*.sql',
  
  // Browser specific files
  'browser-*.js',
  'chrome-*.js',
  
  // Supabase maintenance files
  'supabase-*.js',
  'supabase-*.html',
  
  // Other maintenance files
  'one-line-check.js',
  'final-*.js',
  'simple-*.mjs',
  'run-*.js',
  'trigger-*.js',
  
  // Documentation that's debug/test related
  '*DEBUG*.md',
  '*TEST*.md',
  '*DIAGNOSTIC*.md',
  '*DELETION*.md',
  '*IMMEDIATE*.js',
  '*COMPLETE*.js',
  '*COMPREHENSIVE*.js',
  
  // HTML tools
  '*.html' // Remove all HTML files except index.html
];

const foldersToRemove = [
  'debug',
  'test',
  'tests',
  'diagnostic',
  'demo',
  'recovery',
  'backup',
  'temp',
  'tmp'
];

// Core files to PRESERVE (these are essential for the application)
const coreFilesToPreserve = [
  // Main application files
  'src/main.jsx',
  'src/App.jsx',
  'src/CleanApp.jsx',
  'index.html',
  
  // Core components
  'src/components/ABCDBCDNumber.jsx',
  'src/components/IndexPage.jsx',
  'src/components/Rule2CompactPage.jsx',
  'src/components/Rule2Page.jsx',
  'src/components/CleanIndexPage.jsx',
  'src/components/CleanRule2Page.jsx',
  'src/components/UserData.jsx',
  'src/components/UserList.jsx',
  'src/components/Auth.jsx',
  'src/components/SimpleAuth.jsx',
  'src/components/ProtectedRoute.jsx',
  'src/components/SimpleProtectedRoute.jsx',
  'src/components/DayDetails.jsx',
  'src/components/NumberGen.jsx',
  'src/components/ErrorBoundary.jsx',
  'src/components/ProgressBar.jsx',
  'src/components/HouseCountTest.jsx',
  
  // Services
  'src/services/dataService.js',
  'src/services/CleanSupabaseService.js',
  'src/services/HouseCountService.js',
  'src/services/PagesDataService.js',
  'src/services/DataOrchestrator.js',
  'src/services/rule2ResultsService.js',
  
  // Utils
  'src/utils/abcdBcdAnalysis.js',
  'src/utils/houseCalculations.js',
  'src/utils/exportUtils.js',
  'src/utils/constants.js',
  'src/utils/backupService.js',
  'src/utils/migrationHelper.js',
  'src/utils/migrationPatterns.js',
  
  // Helpers
  'src/helpers/supabaseStorageHelpers.js',
  
  // Config files
  'package.json',
  'vite.config.js',
  'tailwind.config.js',
  'postcss.config.js',
  '.env',
  '.env.local',
  '.env.example',
  
  // Supabase
  'src/supabaseClient.js',
  'supabase/',
  
  // Git and other configs
  '.gitignore',
  'README.md',
  'CLEAN-ARCHITECTURE-README.md',
  'CLEAN-SUPABASE-ARCHITECTURE.md',
  
  // CSS
  'src/index.css',
  'src/App.css',
  'src/components/IndexPage.css'
];

console.log('📋 Cleanup Plan Created');
console.log('Files marked for removal:', filesToRemove.length, 'patterns');
console.log('Core files to preserve:', coreFilesToPreserve.length, 'files');
console.log('');
console.log('🎯 Next: Run the actual cleanup script');

export { filesToRemove, foldersToRemove, coreFilesToPreserve };
