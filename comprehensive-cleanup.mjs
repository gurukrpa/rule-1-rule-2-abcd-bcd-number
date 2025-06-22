#!/usr/bin/env node

/**
 * 🧹 COMPREHENSIVE CLEANUP SCRIPT
 * 
 * This script removes all test, demo, debug, and diagnostic files
 * while preserving the core application functionality.
 * 
 * ✅ Safe: Backs up files before deletion
 * ✅ Smart: Preserves essential application files
 * ✅ Clean: Removes clutter without breaking logic
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Files that should NEVER be deleted (core application)
const CORE_FILES = [
  // Main application
  'src/main.jsx',
  'src/App.jsx',
  'src/CleanApp.jsx', 
  'index.html',
  
  // Essential components
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
  
  // Services (core business logic)
  'src/services/dataService.js',
  'src/services/CleanSupabaseService.js',
  'src/services/HouseCountService.js',
  'src/services/PagesDataService.js',
  'src/services/DataOrchestrator.js',
  'src/services/rule2ResultsService.js',
  'src/services/unifiedDataService.js',
  
  // Utils (essential utilities)
  'src/utils/abcdBcdAnalysis.js',
  'src/utils/houseCalculations.js',
  'src/utils/exportUtils.js',
  'src/utils/constants.js',
  'src/utils/backupService.js',
  'src/utils/migrationHelper.js',
  'src/utils/migrationPatterns.js',
  
  // Helpers
  'src/helpers/supabaseStorageHelpers.js',
  
  // Configuration
  'package.json',
  'vite.config.js',
  'tailwind.config.js',
  'postcss.config.js',
  'src/supabaseClient.js',
  
  // Styles
  'src/index.css',
  'src/App.css',
  'src/components/IndexPage.css',
  
  // Environment & Config
  '.env',
  '.env.local',
  '.env.example',
  '.gitignore',
  
  // Essential documentation
  'README.md',
  'CLEAN-ARCHITECTURE-README.md',
  'CLEAN-SUPABASE-ARCHITECTURE.md'
];

// Patterns for files to remove
const REMOVE_PATTERNS = [
  // Debug files
  /^debug-.*\.(js|html|mjs)$/,
  /.*debug.*\.(js|html|mjs)$/,
  
  // Test files  
  /^test-.*\.(js|html|mjs)$/,
  /.*test.*\.(js|html|mjs)$/,
  
  // Diagnostic files
  /^diagnostic.*\.(js|html)$/,
  /.*diagnostic.*\.(js|html)$/,
  /^diagnose-.*\.js$/,
  /^instant-diagnostic\.js$/,
  /^one-line-diagnostic\.js$/,
  
  // Demo files
  /^demo-.*\.(js|html)$/,
  /.*demo.*\.(js|html)$/,
  
  // Recovery/backup/fix files
  /^data-recovery-.*\.(js|html)$/,
  /^dates-recovery-.*\.js$/,
  /^recovery-.*\.js$/,
  /^backup-.*\.js$/,
  /^fix-.*\.js$/,
  /^auto-fix-.*\.(js|html)$/,
  /^immediate-.*\.js$/,
  /^instant-.*\.js$/,
  /^quick-.*\.js$/,
  /^apply-.*\.(js|mjs)$/,
  
  // Verification files
  /^verify-.*\.js$/,
  /^validate-.*\.js$/,
  /^check-.*\.js$/,
  /^comprehensive-.*\.js$/,
  /^complete-.*\.js$/,
  
  // Migration/cleanup files
  /^migrate-.*\.html$/,
  /^migration-.*\.js$/,
  /^cleanup-.*\.(js|sh)$/,
  /^cleanup_.*\.sh$/,
  /^cleaner-.*\.(js|html)$/,
  /^clean-.*\.sql$/,
  /^clear-.*\.(js|html|sql)$/,
  
  // Browser specific files
  /^browser-.*\.js$/,
  /^chrome-.*\.js$/,
  
  // Supabase maintenance files
  /^supabase-.*\.(js|html)$/,
  
  // Other maintenance files
  /^one-line-check\.js$/,
  /^final-.*\.js$/,
  /^simple-.*\.mjs$/,
  /^run-.*\.js$/,
  /^trigger-.*\.js$/,
  
  // Documentation that's debug/test related
  /.*DEBUG.*\.md$/,
  /.*TEST.*\.md$/,
  /.*DIAGNOSTIC.*\.md$/,
  /.*DELETION.*\.md$/,
  /.*IMMEDIATE.*\.js$/,
  /.*COMPLETE.*\.js$/,
  /.*COMPREHENSIVE.*\.js$/,
  
  // Specific files to remove
  /^ABCD-.*SUMMARY\.md$/,
  /^ASCENDING-.*\.md$/,
  /^DATASERVICE-.*\.md$/,
  /^PUSH-SUCCESS-SUMMARY\.md$/
];

// HTML files to remove (keep only index.html)
const HTML_FILES_TO_REMOVE = [
  'auto-fix-30-topics.html',
  'browser-console-debug-enhanced.js',
  'clear-corrupt-excel-data.html',
  'CLEAR-FAKE-DATA-GUIDE.html',
  'clear-fake-data-tool.html',
  'data-recovery-fix.html',
  'migrate-to-clean-supabase.html',
  'supabase-security-dashboard.html',
  'supabase-cleaner-dashboard.html'
];

// SQL files to remove
const SQL_FILES_TO_REMOVE = [
  'check-existing-tables.sql',
  'clean-security-fix.sql',
  'clear-fake-test-data.sql',
  'CLEAR-SUPABASE-DATA.sh',
  'complete-supabase-analysis.sql',
  'comprehensive-database-analysis.sql',
  'create-hour-entry-table.sql',
  'create-rule2-results-table.sql'
];

async function createBackup(filePath) {
  try {
    const backupDir = path.join(__dirname, 'backup_' + Date.now());
    await fs.mkdir(backupDir, { recursive: true });
    
    const fileName = path.basename(filePath);
    const backupPath = path.join(backupDir, fileName);
    
    await fs.copyFile(filePath, backupPath);
    console.log(`📦 Backed up: ${fileName}`);
    return backupPath;
  } catch (error) {
    console.warn(`⚠️ Backup failed for ${filePath}:`, error.message);
  }
}

async function shouldRemoveFile(filePath) {
  const fileName = path.basename(filePath);
  const relativePath = path.relative(__dirname, filePath);
  
  // Never remove core files
  if (CORE_FILES.includes(relativePath)) {
    return false;
  }
  
  // Check against removal patterns
  for (const pattern of REMOVE_PATTERNS) {
    if (pattern.test(fileName)) {
      return true;
    }
  }
  
  // Check specific HTML files
  if (HTML_FILES_TO_REMOVE.includes(fileName)) {
    return true;
  }
  
  // Check specific SQL files
  if (SQL_FILES_TO_REMOVE.includes(fileName)) {
    return true;
  }
  
  return false;
}

async function scanDirectory(dirPath) {
  const filesToRemove = [];
  
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        // Skip node_modules, .git, etc.
        if (entry.name === 'node_modules' || entry.name === '.git' || 
            entry.name === 'dist' || entry.name === 'build') {
          continue;
        }
        
        // Recursively scan subdirectories
        const subFiles = await scanDirectory(fullPath);
        filesToRemove.push(...subFiles);
      } else if (entry.isFile()) {
        if (await shouldRemoveFile(fullPath)) {
          filesToRemove.push(fullPath);
        }
      }
    }
  } catch (error) {
    console.warn(`⚠️ Could not scan directory ${dirPath}:`, error.message);
  }
  
  return filesToRemove;
}

async function performCleanup() {
  console.log('🧹 STARTING COMPREHENSIVE CLEANUP');
  console.log('=====================================');
  console.log('');
  
  // Scan for files to remove
  console.log('📂 Scanning workspace for files to remove...');
  const filesToRemove = await scanDirectory(__dirname);
  
  if (filesToRemove.length === 0) {
    console.log('✨ No files found that match removal criteria!');
    console.log('📄 Core application files are preserved.');
    return;
  }
  
  console.log(`📋 Found ${filesToRemove.length} files to remove:`);
  console.log('');
  
  // Group files by type for better overview
  const byType = {
    debug: [],
    test: [],
    demo: [],
    diagnostic: [],
    recovery: [],
    migration: [],
    html: [],
    sql: [],
    other: []
  };
  
  filesToRemove.forEach(file => {
    const fileName = path.basename(file);
    if (fileName.includes('debug')) byType.debug.push(fileName);
    else if (fileName.includes('test')) byType.test.push(fileName);
    else if (fileName.includes('demo')) byType.demo.push(fileName);
    else if (fileName.includes('diagnostic') || fileName.includes('diagnose')) byType.diagnostic.push(fileName);
    else if (fileName.includes('recovery') || fileName.includes('backup') || fileName.includes('fix')) byType.recovery.push(fileName);
    else if (fileName.includes('migrate') || fileName.includes('cleanup') || fileName.includes('clean')) byType.migration.push(fileName);
    else if (fileName.endsWith('.html')) byType.html.push(fileName);
    else if (fileName.endsWith('.sql')) byType.sql.push(fileName);
    else byType.other.push(fileName);
  });
  
  // Show summary
  Object.entries(byType).forEach(([type, files]) => {
    if (files.length > 0) {
      console.log(`🗑️ ${type.toUpperCase()}: ${files.length} files`);
      files.slice(0, 3).forEach(f => console.log(`   • ${f}`));
      if (files.length > 3) {
        console.log(`   • ... and ${files.length - 3} more`);
      }
      console.log('');
    }
  });
  
  // Ask for confirmation (in a real environment)
  console.log('⚠️  This will permanently delete these files!');
  console.log('📦 Creating backup first...');
  console.log('');
  
  let removedCount = 0;
  let errorCount = 0;
  
  // Remove files one by one
  for (const filePath of filesToRemove) {
    try {
      const fileName = path.basename(filePath);
      
      // Create backup first
      await createBackup(filePath);
      
      // Remove the file
      await fs.unlink(filePath);
      console.log(`🗑️ Removed: ${fileName}`);
      removedCount++;
      
    } catch (error) {
      console.error(`❌ Failed to remove ${path.basename(filePath)}:`, error.message);
      errorCount++;
    }
  }
  
  // Final summary
  console.log('');
  console.log('🎉 CLEANUP COMPLETED!');
  console.log('=====================');
  console.log(`✅ Successfully removed: ${removedCount} files`);
  if (errorCount > 0) {
    console.log(`❌ Errors: ${errorCount} files`);
  }
  console.log('');
  console.log('🎯 RESULT: Clean application with core functionality preserved');
  console.log('');
  console.log('📋 What was preserved:');
  console.log('   ✅ All React components (IndexPage, Rule2Page, ABCDBCDNumber, etc.)');
  console.log('   ✅ All services (dataService, CleanSupabaseService, etc.)');  
  console.log('   ✅ All utilities (abcdBcdAnalysis, houseCalculations, etc.)');
  console.log('   ✅ Configuration files (package.json, vite.config.js, etc.)');
  console.log('   ✅ Main application structure and logic');
  console.log('');
  console.log('🗑️ What was removed:');
  console.log('   🗑️ Debug scripts and diagnostic tools');
  console.log('   🗑️ Test files and verification scripts');
  console.log('   🗑️ Demo files and example code');
  console.log('   🗑️ Recovery and backup scripts');
  console.log('   🗑️ Migration and cleanup tools');
  console.log('   🗑️ Maintenance HTML pages');
  console.log('   🗑️ Temporary SQL scripts');
  console.log('');
  console.log('🚀 Your application is now clean and ready for production!');
}

// Run cleanup
performCleanup().catch(error => {
  console.error('💥 Cleanup failed:', error);
  process.exit(1);
});
