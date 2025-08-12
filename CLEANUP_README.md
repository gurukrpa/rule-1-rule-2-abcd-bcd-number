# Backup File Cleanup Script

This script provides comprehensive cleanup of editor/agent backup files from your React/Vite project workspace.

## Features

- **Safe Operation**: Dry-run mode by default to preview changes
- **Comprehensive Pattern Matching**: Removes various backup file types
- **Protected Files**: Never removes critical project files
- **Detailed Logging**: Creates timestamped log files for audit trail
- **Configuration Hardening**: Updates .gitignore and vite.config.js
- **Statistics**: Reports files scanned, found, removed, and disk space freed

## Usage

### Dry Run (Preview Mode - Default)
```bash
node cleanup-backup-files.js
```

### Live Mode (Actually Remove Files)
```bash
node cleanup-backup-files.js --live
```

### Verbose Mode
```bash
node cleanup-backup-files.js --verbose
node cleanup-backup-files.js --live --verbose
```

## Backup File Patterns Detected

The script identifies and removes files matching these patterns:

- `._.!*!._*` - Editor/agent backup files with number patterns
- `*.bak` - Standard backup files
- `*~` - Text editor backup files
- `.#*` and `#*#` - Temporary/autosave files
- `*.swp`, `*.swo` - Vim swap files
- `*.tmp`, `*.temp` - Temporary files
- `._*` - macOS metadata files
- `.DS_Store` - macOS directory service files
- `Thumbs.db` - Windows thumbnail cache
- `*.orig`, `*.rej` - Merge conflict and patch files
- `*.old`, `*.backup`, `*.save`, `*.autosave` - Various backup formats
- `*.pid`, `*.lock` - Process and lock files

## Protected Files

These critical files are never removed:
- `package.json`, `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`
- `vite.config.js`, `vite.config.ts`
- `.gitignore`, `.gitattributes`
- `README.md`, `LICENSE`
- `tsconfig.json`, `jsconfig.json`
- `.env*` files

## Protected Directories

These directories are skipped entirely:
- `node_modules`
- `.git`
- `dist`, `build`
- `.vscode`, `.idea`

## Configuration Hardening

The script automatically:

1. **Updates .gitignore** with backup file patterns to prevent future commits
2. **Updates vite.config.js** with watch ignore patterns for better performance

## Safety Features

- **Dry-run by default**: Preview changes before execution
- **Detailed logging**: All operations logged to timestamped files
- **Error handling**: Continues operation even if individual files fail
- **Protected file checks**: Multiple layers of protection for critical files
- **Graceful interruption**: Handle Ctrl+C cleanly

## Output

The script provides:
- Real-time progress updates
- Comprehensive summary statistics
- Detailed log file for audit purposes
- File size calculations for disk space freed

## Log Files

Each run creates a log file named `cleanup-log-[timestamp].txt` containing:
- All operations performed
- Files found and removed
- Any errors encountered
- Final statistics

## Example Output

```
[2024-01-15T10:30:00.000Z] [INFO] Starting comprehensive backup file cleanup
[2024-01-15T10:30:00.001Z] [INFO] Mode: DRY RUN
[2024-01-15T10:30:00.002Z] [INFO] Log file: /path/to/project/cleanup-log-1705315800000.txt
...
============================================================
CLEANUP SUMMARY
============================================================
Files scanned: 5,234
Backup files found: 1,847
Files removed: 0
Errors encountered: 0
Total size freed: 45.67 MB
Execution time: 3.42 seconds
Mode: DRY RUN - No files were actually removed

To perform the actual cleanup, run: node cleanup-backup-files.js --live
============================================================
```

## Best Practices

1. Always run in dry-run mode first to review what will be removed
2. Check the log file after each run for any unexpected issues
3. Commit your current work to git before running the live cleanup
4. Run the script periodically to maintain a clean workspace

## Troubleshooting

- If the script seems stuck, it may be processing a very large directory
- Check the log file for detailed error information
- Use `--verbose` mode to see exactly what files are being processed
- The script can be safely interrupted with Ctrl+C
