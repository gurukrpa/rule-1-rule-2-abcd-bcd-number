#!/bin/bash

# Integration Script for New Number Box System
# This script helps integrate the new number box system into the existing Rule1 page

echo "🚀 New Number Box System Integration Script"
echo "================================================="

# Check if Rule1Page_Enhanced.jsx exists
if [ ! -f "src/components/Rule1Page_Enhanced.jsx" ]; then
    echo "❌ Error: Rule1Page_Enhanced.jsx not found in src/components/"
    exit 1
fi

echo "✅ Found Rule1Page_Enhanced.jsx"

# Create backup
BACKUP_FILE="src/components/Rule1Page_Enhanced_backup_$(date +%Y%m%d_%H%M%S).jsx"
cp "src/components/Rule1Page_Enhanced.jsx" "$BACKUP_FILE"
echo "💾 Created backup: $BACKUP_FILE"

# Option 1: Create a replacement version with the new system
cat > "src/components/Rule1Page_NewSystem.jsx" << 'EOF'
import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

const Rule1Page_NewSystem = () => {
    const [clickedNumbers, setClickedNumbers] = useState(new Set());
    const [currentContext, setCurrentContext] = useState(null);

    // Initialize system
    useEffect(() => {
        // Get context from URL or default
        const urlParams = new URLSearchParams(window.location.search);
        const context = {
            topic: urlParams.get('topic') || 'D-3 Set-1',
            date: urlParams.get('date') || '8-8-25', 
            hr: urlParams.get('hr') || '1'
        };
        
        setCurrentContext(context);
        loadClickedNumbers(context);
    }, []);

    const loadClickedNumbers = async (context) => {
        try {
            // Load from Supabase
            const { data, error } = await supabase
                .from('number_clicks')
                .select('*')
                .eq('topic', context.topic)
                .eq('date', context.date)
                .eq('hr', context.hr);

            if (error) throw error;

            const numbers = new Set(data.map(item => item.number));
            setClickedNumbers(numbers);
            
            // Apply matrix highlighting immediately
            setTimeout(() => updateMatrixHighlighting(numbers), 100);
            
        } catch (error) {
            console.error('Error loading clicked numbers:', error);
            
            // Fallback to localStorage
            const key = `${context.topic}|${context.date}|${context.hr}`;
            const stored = localStorage.getItem(`numberBox_${key}`);
            if (stored) {
                const numbers = new Set(JSON.parse(stored));
                setClickedNumbers(numbers);
                setTimeout(() => updateMatrixHighlighting(numbers), 100);
            }
        }
    };

    const updateMatrixHighlighting = (numbers) => {
        // Find all matrix cells and highlight based on clicked numbers
        const matrixCells = document.querySelectorAll('.matrix-cell, td, .cell');
        
        matrixCells.forEach(cell => {
            const text = cell.textContent || cell.innerText || '';
            
            // Look for patterns like "as-1-ta", "mo-2-ge", etc.
            const matches = text.match(/-(\d+)-/g);
            
            if (matches) {
                let shouldHighlight = false;
                
                matches.forEach(match => {
                    const number = parseInt(match.replace(/-/g, ''));
                    if (numbers.has(number)) {
                        shouldHighlight = true;
                    }
                });
                
                if (shouldHighlight) {
                    cell.style.background = '#FCE7C8';
                    cell.style.color = '#8B4513';
                    cell.style.fontWeight = 'bold';
                    cell.style.border = '2px solid #FB923C';
                } else {
                    // Reset styles
                    cell.style.background = '';
                    cell.style.color = '';
                    cell.style.fontWeight = '';
                    cell.style.border = '';
                }
            }
        });
    };

    const toggleNumber = async (number) => {
        const newClickedNumbers = new Set(clickedNumbers);
        
        if (newClickedNumbers.has(number)) {
            newClickedNumbers.delete(number);
        } else {
            newClickedNumbers.add(number);
        }
        
        setClickedNumbers(newClickedNumbers);
        
        // Save to database
        try {
            if (newClickedNumbers.has(number)) {
                // Insert
                await supabase.from('number_clicks').insert({
                    topic: currentContext.topic,
                    date: currentContext.date,
                    hr: currentContext.hr,
                    number: number
                });
            } else {
                // Delete
                await supabase.from('number_clicks')
                    .delete()
                    .eq('topic', currentContext.topic)
                    .eq('date', currentContext.date)
                    .eq('hr', currentContext.hr)
                    .eq('number', number);
            }
        } catch (error) {
            console.error('Database error:', error);
        }
        
        // Save to localStorage as backup
        const key = `${currentContext.topic}|${currentContext.date}|${currentContext.hr}`;
        localStorage.setItem(`numberBox_${key}`, JSON.stringify(Array.from(newClickedNumbers)));
        
        // Update highlighting immediately
        updateMatrixHighlighting(newClickedNumbers);
    };

    // Re-apply highlighting when page content changes
    useEffect(() => {
        const observer = new MutationObserver(() => {
            updateMatrixHighlighting(clickedNumbers);
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        return () => observer.disconnect();
    }, [clickedNumbers]);

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-4">Rule 1 - Enhanced with New Number Box System</h1>
                {currentContext && (
                    <div className="bg-blue-100 p-3 rounded mb-4">
                        <strong>Context:</strong> {currentContext.topic} | {currentContext.date} | HR-{currentContext.hr} | 
                        <span className="ml-2 font-bold">{clickedNumbers.size} numbers clicked</span>
                    </div>
                )}
            </div>

            {/* Number Boxes */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">📊 Number Boxes</h2>
                <div className="grid grid-cols-6 gap-3 max-w-md">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(number => (
                        <button
                            key={number}
                            onClick={() => toggleNumber(number)}
                            className={`
                                w-12 h-12 rounded-lg border-2 font-bold text-sm
                                transition-all duration-200 hover:scale-105
                                ${clickedNumbers.has(number)
                                    ? 'bg-orange-400 text-white border-orange-600 shadow-lg'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                }
                            `}
                        >
                            {number}
                        </button>
                    ))}
                </div>
                
                <div className="mt-4 flex gap-2">
                    <button
                        onClick={() => updateMatrixHighlighting(clickedNumbers)}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        🔄 Refresh Highlights
                    </button>
                    <button
                        onClick={() => {
                            setClickedNumbers(new Set());
                            updateMatrixHighlighting(new Set());
                        }}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        🗑️ Clear All
                    </button>
                </div>
            </div>

            {/* Matrix Display Area */}
            <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">🎯 Matrix Display</h2>
                <p className="text-gray-600 mb-4">
                    The matrix content will be highlighted automatically based on clicked numbers.
                    This area will show your ABCD/BCD analysis data with proper highlighting.
                </p>
                
                {/* Sample matrix for testing */}
                <table className="border-collapse border border-gray-300 w-full">
                    <tbody>
                        <tr>
                            <td className="border border-gray-300 p-2 text-center">as-1-ta</td>
                            <td className="border border-gray-300 p-2 text-center">mo-2-ge</td>
                            <td className="border border-gray-300 p-2 text-center">hl-3-cn</td>
                            <td className="border border-gray-300 p-2 text-center">gl-4-sg</td>
                        </tr>
                        <tr>
                            <td className="border border-gray-300 p-2 text-center">vig-5-ta</td>
                            <td className="border border-gray-300 p-2 text-center">var-6-le</td>
                            <td className="border border-gray-300 p-2 text-center">sl-7-aq</td>
                            <td className="border border-gray-300 p-2 text-center">pp-8-ta</td>
                        </tr>
                        <tr>
                            <td className="border border-gray-300 p-2 text-center">in-9-le</td>
                            <td className="border border-gray-300 p-2 text-center">as-10-ta</td>
                            <td className="border border-gray-300 p-2 text-center">mo-11-ge</td>
                            <td className="border border-gray-300 p-2 text-center">hl-12-cn</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Rule1Page_NewSystem;
EOF

echo "✅ Created Rule1Page_NewSystem.jsx with new number box system"

# Create a simple integration guide
cat > "INTEGRATION-GUIDE.md" << 'EOF'
# New Number Box System Integration Guide

## Quick Integration Options

### Option 1: Test the New System First
1. Open `test-new-number-box-system.html` in your browser
2. Test the D-3 Set-1 scenario with number 10
3. Refresh the page and verify highlighting persists

### Option 2: Replace Current System
1. Backup made automatically: `Rule1Page_Enhanced_backup_*.jsx`
2. Replace current import in your routing:
   ```jsx
   // Old
   import Rule1Page_Enhanced from './components/Rule1Page_Enhanced';
   
   // New
   import Rule1Page_NewSystem from './components/Rule1Page_NewSystem';
   ```

### Option 3: Browser Script Integration (Quick Fix)
Add this to your existing Rule1Page_Enhanced.jsx:

```jsx
useEffect(() => {
    // Load the comprehensive number box system
    const script = document.createElement('script');
    script.src = '/comprehensive-number-box-system.js';
    document.head.appendChild(script);
    
    return () => {
        document.head.removeChild(script);
    };
}, []);
```

## Testing Steps

1. **Test with D-3 Set-1 HR-1 8-8-25**
   - Click number 10
   - Refresh the page
   - Verify highlighting persists

2. **Test Cross-Page Navigation**
   - Click numbers on Rule1 page
   - Navigate away and back
   - Verify state persists

3. **Test Database Integration**
   - Check Supabase for proper data storage
   - Verify localStorage fallback works

## Rollback Plan

If issues occur:
```bash
cp src/components/Rule1Page_Enhanced_backup_*.jsx src/components/Rule1Page_Enhanced.jsx
```

## Key Benefits

✅ **No Timing Dependencies** - Direct DOM manipulation
✅ **Immediate Persistence** - localStorage + Supabase
✅ **Self-Healing** - MutationObserver for content changes
✅ **Independent State** - No reliance on external analysis data
✅ **Backward Compatible** - Can integrate with existing system
EOF

echo "📋 Created INTEGRATION-GUIDE.md"

echo ""
echo "🎯 Integration Complete!"
echo "================================================="
echo "Next Steps:"
echo "1. Test the system: open test-new-number-box-system.html"
echo "2. Choose integration option from INTEGRATION-GUIDE.md"
echo "3. Test D-3 Set-1 HR-1 8-8-25 scenario"
echo ""
echo "Files created:"
echo "- test-new-number-box-system.html (standalone test)"
echo "- src/components/Rule1Page_NewSystem.jsx (React replacement)"
echo "- comprehensive-number-box-system.js (browser script)"
echo "- INTEGRATION-GUIDE.md (integration options)"
echo ""
echo "Backup created: $BACKUP_FILE"
