#!/usr/bin/env node

/**
 * Comprehensive Backup File Cleanup Script
 * Safely removes editor/agent backup files from the project
 * Includes safety checks, logging, and dry-run mode
 */

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

class BackupCleaner {
    constructor(options = {}) {
        this.dryRun = options.dryRun || false;
        this.verbose = options.verbose || false;
        this.backupPatterns = [
            /^\._\.!.*!\._.*/,                    // ._.!numbers!._filename.ext patterns
            /.*\.bak$/,                           // .bak files
            /.*~$/,                               // ~ backup files
            /^\.\#.*$/,                           // .# temporary files
            /^\#.*\#$/,                           // #file# autosave files
            /.*\.swp$/,                           // vim swap files
            /.*\.swo$/,                           // vim swap files
            /.*\.tmp$/,                           // temporary files
            /.*\.temp$/,                          // temporary files
            /^\._.*$/,                            // ._ files (macOS metadata)
            /^\.DS_Store$/,                       // macOS directory service files
            /^Thumbs\.db$/,                       // Windows thumbnail cache
            /.*\.orig$/,                          // merge conflict originals
            /.*\.rej$/,                           // patch reject files
            /.*\.old$/,                           // old file backups
            /.*\.backup$/,                        // explicit backup files
            /.*\.save$/,                          // save files
            /.*\.autosave$/,                      // autosave files
            /^\.#.*$/,                            // emacs lock files
            /.*\.pid$/,                           // process ID files
            /.*\.lock$/,                          // lock files
        ];
        
        this.protectedFiles = [
            'package.json',
            'package-lock.json',
            'yarn.lock',
            'pnpm-lock.yaml',
            'vite.config.js',
            'vite.config.ts',
            '.gitignore',
            '.gitattributes',
            'README.md',
            'LICENSE',
            'tsconfig.json',
            'jsconfig.json',
            '.env',
            '.env.local',
            '.env.production'
        ];
        
        this.protectedDirs = [
            'node_modules',
            '.git',
            'dist',
            'build',
            '.vscode',
            '.idea'
        ];
        
        this.stats = {
            scanned: 0,
            found: 0,
            removed: 0,
            errors: 0,
            totalSize: 0
        };
        
        this.logFile = path.join(process.cwd(), `cleanup-log-${Date.now()}.txt`);
    }

    log(message, level = 'INFO') {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [${level}] ${message}`;
        
        console.log(logMessage);
        
        // Write to log file
        fs.appendFileSync(this.logFile, logMessage + '\n');
    }

    isBackupFile(filename) {
        return this.backupPatterns.some(pattern => pattern.test(filename));
    }

    isProtectedFile(filename) {
        return this.protectedFiles.includes(filename);
    }

    shouldSkipDirectory(dirname) {
        return this.protectedDirs.includes(dirname);
    }

    async getFileSize(filePath) {
        try {
            const stats = await fs.promises.stat(filePath);
            return stats.size;
        } catch (error) {
            return 0;
        }
    }

    async scanDirectory(dirPath) {
        try {
            const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dirPath, entry.name);
                
                if (entry.isDirectory()) {
                    if (!this.shouldSkipDirectory(entry.name)) {
                        await this.scanDirectory(fullPath);
                    }
                } else if (entry.isFile()) {
                    this.stats.scanned++;
                    
                    if (this.isBackupFile(entry.name) && !this.isProtectedFile(entry.name)) {
                        this.stats.found++;
                        const fileSize = await this.getFileSize(fullPath);
                        this.stats.totalSize += fileSize;
                        
                        if (this.verbose) {
                            this.log(`Found backup file: ${fullPath} (${fileSize} bytes)`);
                        }
                        
                        if (!this.dryRun) {
                            try {
                                await fs.promises.unlink(fullPath);
                                this.stats.removed++;
                                this.log(`Removed: ${fullPath}`, 'SUCCESS');
                            } catch (error) {
                                this.stats.errors++;
                                this.log(`Error removing ${fullPath}: ${error.message}`, 'ERROR');
                            }
                        } else {
                            this.log(`[DRY RUN] Would remove: ${fullPath}`);
                        }
                    }
                }
            }
        } catch (error) {
            this.log(`Error scanning directory ${dirPath}: ${error.message}`, 'ERROR');
            this.stats.errors++;
        }
    }

    formatFileSize(bytes) {
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;
        
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        
        return `${size.toFixed(2)} ${units[unitIndex]}`;
    }

    async createGitIgnoreEntries() {
        const gitIgnorePath = path.join(process.cwd(), '.gitignore');
        const backupPatterns = [
            '# Editor/Agent backup files',
            '._.!*!._*',
            '*.bak',
            '*~',
            '.#*',
            '#*#',
            '*.swp',
            '*.swo',
            '*.tmp',
            '*.temp',
            '._*',
            '.DS_Store',
            'Thumbs.db',
            '*.orig',
            '*.rej',
            '*.old',
            '*.backup',
            '*.save',
            '*.autosave',
            '*.pid',
            '*.lock',
            '',
            '# Cleanup logs',
            'cleanup-log-*.txt',
            ''
        ];

        try {
            let gitIgnoreContent = '';
            if (fs.existsSync(gitIgnorePath)) {
                gitIgnoreContent = await fs.promises.readFile(gitIgnorePath, 'utf8');
            }

            // Check if backup patterns are already present
            const hasBackupPatterns = backupPatterns.some(pattern => 
                pattern.trim() && gitIgnoreContent.includes(pattern)
            );

            if (!hasBackupPatterns) {
                const newContent = gitIgnoreContent + '\n' + backupPatterns.join('\n');
                if (!this.dryRun) {
                    await fs.promises.writeFile(gitIgnorePath, newContent);
                    this.log('Updated .gitignore with backup file patterns', 'SUCCESS');
                } else {
                    this.log('[DRY RUN] Would update .gitignore with backup file patterns');
                }
            } else {
                this.log('.gitignore already contains backup file patterns');
            }
        } catch (error) {
            this.log(`Error updating .gitignore: ${error.message}`, 'ERROR');
        }
    }

    async updateViteConfig() {
        const viteConfigPath = path.join(process.cwd(), 'vite.config.js');
        
        if (!fs.existsSync(viteConfigPath)) {
            this.log('vite.config.js not found, skipping Vite configuration update');
            return;
        }

        try {
            const viteConfig = await fs.promises.readFile(viteConfigPath, 'utf8');
            
            // Check if watch ignore patterns are already present
            if (viteConfig.includes('watchOptions') && viteConfig.includes('ignored')) {
                this.log('Vite config already has watch ignore patterns');
                return;
            }

            // Add watch ignore patterns to Vite config
            const ignorePatterns = `
    server: {
      watch: {
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          '**/dist/**',
          '**/build/**',
          '**/._.!*!._*',
          '**/*.bak',
          '**/*~',
          '**/.#*',
          '**/#*#',
          '**/*.swp',
          '**/*.swo',
          '**/*.tmp',
          '**/*.temp',
          '**/._*',
          '**/.DS_Store',
          '**/Thumbs.db',
          '**/*.orig',
          '**/*.rej',
          '**/*.old',
          '**/*.backup',
          '**/*.save',
          '**/*.autosave',
          '**/cleanup-log-*.txt'
        ]
      }
    },`;

            if (!this.dryRun) {
                // Simple insertion after the export default defineConfig line
                const updatedConfig = viteConfig.replace(
                    /export default defineConfig\(\{/,
                    `export default defineConfig({${ignorePatterns}`
                );
                
                if (updatedConfig !== viteConfig) {
                    await fs.promises.writeFile(viteConfigPath, updatedConfig);
                    this.log('Updated vite.config.js with watch ignore patterns', 'SUCCESS');
                } else {
                    this.log('Could not automatically update vite.config.js - manual update may be needed', 'WARNING');
                }
            } else {
                this.log('[DRY RUN] Would update vite.config.js with watch ignore patterns');
            }
        } catch (error) {
            this.log(`Error updating vite.config.js: ${error.message}`, 'ERROR');
        }
    }

    async run() {
        this.log('Starting comprehensive backup file cleanup');
        this.log(`Mode: ${this.dryRun ? 'DRY RUN' : 'LIVE'}`);
        this.log(`Log file: ${this.logFile}`);
        
        const startTime = Date.now();
        
        // Scan and clean files
        await this.scanDirectory(process.cwd());
        
        // Update configuration files
        await this.createGitIgnoreEntries();
        await this.updateViteConfig();
        
        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000;
        
        // Print summary
        this.log('='.repeat(60));
        this.log('CLEANUP SUMMARY');
        this.log('='.repeat(60));
        this.log(`Files scanned: ${this.stats.scanned}`);
        this.log(`Backup files found: ${this.stats.found}`);
        this.log(`Files removed: ${this.stats.removed}`);
        this.log(`Errors encountered: ${this.stats.errors}`);
        this.log(`Total size freed: ${this.formatFileSize(this.stats.totalSize)}`);
        this.log(`Execution time: ${duration.toFixed(2)} seconds`);
        this.log(`Mode: ${this.dryRun ? 'DRY RUN - No files were actually removed' : 'LIVE - Files were permanently removed'}`);
        
        if (this.dryRun && this.stats.found > 0) {
            this.log('');
            this.log('To perform the actual cleanup, run: node cleanup-backup-files.js --live');
        }
        
        this.log('='.repeat(60));
    }
}

// Command line interface
const args = process.argv.slice(2);
const dryRun = !args.includes('--live') && !args.includes('-l');
const verbose = args.includes('--verbose') || args.includes('-v');

const cleaner = new BackupCleaner({ dryRun, verbose });

// Handle graceful shutdown
process.on('SIGINT', () => {
    cleaner.log('Cleanup interrupted by user');
    process.exit(1);
});

// Run the cleanup
cleaner.run().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
