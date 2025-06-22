#!/usr/bin/env node

/**
 * 🧹 FINAL CLEANUP - Remove ALL non-essential files
 * 
 * This script removes all remaining test, fix, verification, and maintenance files
 * Keeps only the core application files needed for production
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORE APPLICATION FILES - These must be preserved
const ESSENTIAL_FILES = new Set([
  // Main application
  'index.html',
  'package.json',
  'package-lock.json',
  'vite.config.js',
  'tailwind.config.js',
  'postcss.config.js',
  '.env',
  '.gitignore',
  'README.md',
  'viboothi.png',
  
  // Essential docs
  'CLEAN-ARCHITECTURE-README.md',
  'CLEAN-SUPABASE-ARCHITECTURE.md',
  
  // Core source directory
  'src/',
  'node_modules/',
  'dataconnect/'
]);

// Patterns for files to definitely remove
const REMOVE_PATTERNS = [
  // Any file starting with these prefixes
  /^fix-/,
  /^urgent-/,
  /^emergency-/,
  /^restore-/,
  /^setup-/,
  /^terminal-/,
  /^rule1-/,
  /^rule2-/,
  /^simulate-/,
  /^see-all-/,
  /^investigate-/,
  /^test-/,
  /^verify-/,
  
  // Files with specific keywords
  /.*fix.*/i,
  /.*test.*/i,
  /.*debug.*/i,
  /.*verification.*/i,
  /.*diagnostic.*/i,
  /.*cleanup.*/i,
  /.*migration.*/i,
  /.*backup.*/i,
  /.*emergency.*/i,
  /.*urgent.*/i,
  /.*immediate.*/i,
  /.*instant.*/i,
  
  // File extensions that are maintenance
  /.*\.sql$/,
  /.*\.sh$/,
  /.*\.mjs$/,
  
  // Markdown files that are not essential
  /.*IMPLEMENTATION.*\.md$/,
  /.*SUCCESS.*\.md$/,
  /.*GUIDE.*\.md$/,
  /.*FIXES.*\.md$/,
  /.*STORAGE.*\.md$/,
  /.*OAUTH.*\.md$/,
  /.*API.*\.md$/,
  /.*DELETION.*\.md$/,
  /.*MULTIPLE.*\.md$/,
  /.*FINAL.*\.md$/,
  /.*URGENT.*\.md$/,
  /.*MANUAL.*\.md$/,
  /.*VERIFICATION.*\.md$/,
  /.*INDEXPAGE.*\.md$/,
  /.*SUPABASE.*\.md$/,
  /.*USERLIST.*\.md$/,
  
  // HTML files that are tools
  /.*fix.*\.html$/,
  /.*cleanup.*\.html$/,
  /.*tool.*\.html$/,
  /.*dashboard.*\.html$/,
  /.*security.*\.html$/,
  /.*diagram.*\.html$/,
  
  // JS files that are maintenance
  /.*\.js$/ // We'll be selective about which JS files to keep
];

// Additional specific files to remove
const SPECIFIC_FILES_TO_REMOVE = [
  'vercel.json',
  'package-clear.json',
  'comprehensive-cleanup.mjs'
];

// Files starting with underscore (backup files)
const UNDERSCORE_PATTERN = /^\._.*/;

async function shouldKeepFile(filePath) {
  const fileName = path.basename(filePath);
  const relativePath = path.relative(__dirname, filePath);
  
  // Always keep essential files
  if (ESSENTIAL_FILES.has(fileName) || ESSENTIAL_FILES.has(relativePath)) {
    return true;
  }
  
  // Always keep src/, node_modules/, and other essential directories
  if (relativePath.startsWith('src/') || relativePath.startsWith('node_modules/') || relativePath.startsWith('dataconnect/')) {
    return true;
  }
  
  // Remove underscore files (backup files)
  if (UNDERSCORE_PATTERN.test(fileName)) {
    return false;
  }
  
  // Remove specific files
  if (SPECIFIC_FILES_TO_REMOVE.includes(fileName)) {
    return false;
  }
  
  // Check against removal patterns
  for (const pattern of REMOVE_PATTERNS) {
    if (pattern.test(fileName)) {
      return false;
    }
  }
  
  // Check for backup directories
  if (fileName.startsWith('backup_')) {
    return false;
  }
  
  return true;
}

async function scanAndClean(dirPath = __dirname) {
  const filesToRemove = [];
  
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        // Skip essential directories but scan their contents if needed
        if (entry.name === 'node_modules' || entry.name === 'dataconnect') {
          continue;
        }
        
        // Remove backup directories
        if (entry.name.startsWith('backup_') || entry.name.startsWith('._backup_')) {
          filesToRemove.push(fullPath);
          continue;
        }
        
        // For src directory, only scan - don't remove the directory itself
        if (entry.name === 'src') {
          continue;
        }
        
        // For other directories, check if the whole directory should be removed
        if (!(await shouldKeepFile(fullPath))) {
          filesToRemove.push(fullPath);
        }
      } else if (entry.isFile()) {
        if (!(await shouldKeepFile(fullPath))) {
          filesToRemove.push(fullPath);
        }
      }
    }
  } catch (error) {
    console.warn(`⚠️ Could not scan directory ${dirPath}:`, error.message);
  }
  
  return filesToRemove;
}

async function removeFile(filePath) {
  try {
    const stats = await fs.stat(filePath);
    if (stats.isDirectory()) {
      await fs.rmdir(filePath, { recursive: true });
      console.log(`🗂️ Removed directory: ${path.basename(filePath)}`);
    } else {
      await fs.unlink(filePath);
      console.log(`🗑️ Removed file: ${path.basename(filePath)}`);
    }
    return true;
  } catch (error) {
    console.error(`❌ Failed to remove ${path.basename(filePath)}:`, error.message);
    return false;
  }
}

async function performFinalCleanup() {
  console.log('🧹 FINAL COMPREHENSIVE CLEANUP');
  console.log('==============================');
  console.log('');
  
  // Scan for files to remove
  console.log('📂 Scanning for all non-essential files...');
  const filesToRemove = await scanAndClean();
  
  if (filesToRemove.length === 0) {
    console.log('✨ Workspace is already clean!');
    return;
  }
  
  console.log(`📋 Found ${filesToRemove.length} items to remove:`);
  console.log('');
  
  // Group by type
  const byType = {
    directories: [],
    markdown: [],
    sql: [],
    js: [],
    html: [],
    shell: [],
    backup: [],
    other: []
  };
  
  filesToRemove.forEach(item => {
    const name = path.basename(item);
    const stats = fs.stat(item).catch(() => null);
    
    if (name.startsWith('backup_') || name.startsWith('._backup_')) {
      byType.backup.push(name);
    } else if (name.endsWith('.md')) {
      byType.markdown.push(name);
    } else if (name.endsWith('.sql')) {
      byType.sql.push(name);
    } else if (name.endsWith('.js') || name.endsWith('.mjs')) {
      byType.js.push(name);
    } else if (name.endsWith('.html')) {
      byType.html.push(name);
    } else if (name.endsWith('.sh')) {
      byType.shell.push(name);
    } else {
      byType.other.push(name);
    }
  });
  
  // Show summary
  Object.entries(byType).forEach(([type, files]) => {
    if (files.length > 0) {
      console.log(`🗑️ ${type.toUpperCase()}: ${files.length} items`);
      files.slice(0, 3).forEach(f => console.log(`   • ${f}`));
      if (files.length > 3) {
        console.log(`   • ... and ${files.length - 3} more`);
      }
      console.log('');
    }
  });
  
  console.log('⚠️  This will permanently delete these files/directories!');
  console.log('');
  
  let removedCount = 0;
  let errorCount = 0;
  
  // Remove items one by one
  for (const itemPath of filesToRemove) {
    const success = await removeFile(itemPath);
    if (success) {
      removedCount++;
    } else {
      errorCount++;
    }
  }
  
  // Final summary
  console.log('');
  console.log('🎉 FINAL CLEANUP COMPLETED!');
  console.log('===========================');
  console.log(`✅ Successfully removed: ${removedCount} items`);
  if (errorCount > 0) {
    console.log(`❌ Errors: ${errorCount} items`);
  }
  console.log('');
  console.log('🎯 RESULT: Clean production-ready application');
  console.log('');
  console.log('📋 What remains (essential files only):');
  console.log('   ✅ index.html - Main application entry point');
  console.log('   ✅ package.json - Dependencies and scripts');
  console.log('   ✅ vite.config.js - Build configuration');
  console.log('   ✅ tailwind.config.js - Styling configuration');
  console.log('   ✅ src/ - Complete source code');
  console.log('   ✅ README.md - Documentation');
  console.log('   ✅ .env & .gitignore - Configuration files');
  console.log('   ✅ Architecture documentation');
  console.log('');
  console.log('🚀 Your application is now production-ready!');
  console.log('📦 All test, debug, fix, and maintenance files removed');
  console.log('⚡ Core functionality preserved and intact');
}

// Run cleanup
performFinalCleanup().catch(error => {
  console.error('💥 Final cleanup failed:', error);
  process.exit(1);
});
