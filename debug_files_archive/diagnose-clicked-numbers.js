#!/usr/bin/env node

/**
 * DIAGNOSTIC SCRIPT: Clicked Numbers Issue Investigation
 * 
 * This script investigates why clicked number boxes are not showing
 * after clicking the "Show Clicked Numbers" button.
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 DIAGNOSING CLICKED NUMBERS ISSUE');
console.log('=====================================\n');

// Check if we're running from the correct directory
const expectedFiles = [
    'src/components/Rule1Page_Enhanced.jsx',
    'src/services/DualServiceManager.js',
    'package.json'
];

console.log('1. CHECKING PROJECT STRUCTURE...');
for (const file of expectedFiles) {
    const exists = fs.existsSync(file);
    console.log(`   ${exists ? '✅' : '❌'} ${file}`);
    if (!exists) {
        console.log(`   ⚠️  Missing required file: ${file}`);
    }
}

// Read and analyze the main component file
console.log('\n2. ANALYZING MAIN COMPONENT...');
try {
    const componentPath = 'src/components/Rule1Page_Enhanced.jsx';
    const componentContent = fs.readFileSync(componentPath, 'utf8');
    
    // Check for key elements
    const checks = [
        {
            name: 'showClickedNumbers function',
            pattern: /const showClickedNumbers\s*=\s*\(\s*\)\s*=>/,
            critical: true
        },
        {
            name: 'loadNumberBoxClicks function',
            pattern: /const loadNumberBoxClicks\s*=\s*useCallback/,
            critical: true
        },
        {
            name: 'numberBoxClicks state',
            pattern: /const\s+\[numberBoxClicks,\s*setNumberBoxClicks\]/,
            critical: true
        },
        {
            name: 'handleNumberBoxClick function',
            pattern: /const handleNumberBoxClick\s*=\s*async/,
            critical: true
        },
        {
            name: 'Debug Tools section',
            pattern: /<div className="debug-tools">/,
            critical: false
        },
        {
            name: 'Show Clicked Numbers button',
            pattern: /onClick={showClickedNumbers}/,
            critical: true
        }
    ];
    
    for (const check of checks) {
        const found = check.pattern.test(componentContent);
        const status = found ? '✅' : (check.critical ? '❌' : '⚠️');
        console.log(`   ${status} ${check.name}`);
        
        if (!found && check.critical) {
            console.log(`      🔍 CRITICAL: Missing ${check.name}`);
        }
    }
    
    // Check for potential issues in showClickedNumbers function
    console.log('\n3. ANALYZING showClickedNumbers FUNCTION...');
    const showClickedNumbersMatch = componentContent.match(/const showClickedNumbers\s*=\s*\(\s*\)\s*=>\s*{([^}]+(?:{[^}]*}[^}]*)*)}/);
    
    if (showClickedNumbersMatch) {
        const functionBody = showClickedNumbersMatch[1];
        console.log('   ✅ Function found');
        
        // Check for common issues
        const functionChecks = [
            {
                name: 'Console.log statements',
                pattern: /console\.log/,
                expected: true
            },
            {
                name: 'numberBoxClicks reference',
                pattern: /numberBoxClicks/,
                expected: true
            },
            {
                name: 'Length check',
                pattern: /\.length/,
                expected: true
            },
            {
                name: 'Filtering logic',
                pattern: /\.filter\(/,
                expected: true
            }
        ];
        
        for (const check of functionChecks) {
            const found = check.pattern.test(functionBody);
            const status = found === check.expected ? '✅' : '❌';
            console.log(`      ${status} ${check.name} ${found ? 'present' : 'missing'}`);
        }
        
        console.log('\n   📋 Function body preview:');
        console.log('   ' + functionBody.trim().split('\n').slice(0, 5).join('\n   '));
        if (functionBody.split('\n').length > 5) {
            console.log('   ...');
        }
    } else {
        console.log('   ❌ showClickedNumbers function not found or malformed');
    }
    
} catch (error) {
    console.log(`   ❌ Error reading component: ${error.message}`);
}

// Check DualServiceManager
console.log('\n4. ANALYZING SERVICE MANAGER...');
try {
    const servicePath = 'src/services/DualServiceManager.js';
    const serviceContent = fs.readFileSync(servicePath, 'utf8');
    
    const serviceChecks = [
        {
            name: 'getNumberBoxClicks method',
            pattern: /getNumberBoxClicks/,
            critical: true
        },
        {
            name: 'saveNumberBoxClick method',
            pattern: /saveNumberBoxClick/,
            critical: true
        },
        {
            name: 'removeNumberBoxClick method',
            pattern: /removeNumberBoxClick/,
            critical: true
        }
    ];
    
    for (const check of serviceChecks) {
        const found = check.pattern.test(serviceContent);
        const status = found ? '✅' : '❌';
        console.log(`   ${status} ${check.name}`);
    }
    
} catch (error) {
    console.log(`   ❌ Error reading service manager: ${error.message}`);
}

console.log('\n5. GENERATING DIAGNOSTIC REPORT...');
console.log('=====================================');

console.log(`
🔧 POTENTIAL ISSUES TO INVESTIGATE:

1. **Browser Console Check**:
   - Open browser DevTools (F12)
   - Click "Show Clicked Numbers" button
   - Check for JavaScript errors in Console tab
   - Look for the debug output messages

2. **State Verification**:
   - In browser console, run: window.debug_showClickedNumbers()
   - Check if numberBoxClicks array has data: numberBoxClicks
   - Verify user state: user

3. **Click Data Verification**:
   - Make sure you've clicked some number boxes first
   - Check if clicks are being saved: window.numberBoxClickHistory
   - Verify localStorage: localStorage.getItem('numberBoxClicks')

4. **Button Event Verification**:
   - Inspect the "Show Clicked Numbers" button in Elements tab
   - Verify onClick handler is attached
   - Check if button click triggers any console output

5. **Database/Service Check**:
   - Verify DualServiceManager.getNumberBoxClicks() returns data
   - Check if the service is properly initialized

📋 NEXT STEPS:
1. Run this diagnostic in browser console while on the Rule1Page
2. Click some number boxes to generate test data
3. Click "Show Clicked Numbers" and observe console output
4. Report back with any error messages or unexpected behavior

🎯 QUICK BROWSER TEST:
Open browser console and run:
- console.log('User:', user);
- console.log('Clicked numbers:', numberBoxClicks);
- showClickedNumbers();
`);

console.log('\n✅ Diagnostic complete. Please run the browser tests above.');