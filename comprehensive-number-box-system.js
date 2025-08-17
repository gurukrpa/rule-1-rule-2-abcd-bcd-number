/**
 * COMPREHENSIVE NUMBER BOX DIAGNOSTIC AND NEW SYSTEM CREATOR
 * 
 * This script will:
 * 1. Test the current D-3 Set-1 8-8-25 issue
 * 2. Create a completely new number box system if needed
 * 
 * USAGE:
 * 1. Navigate to Rule1 page
 * 2. Open browser console
 * 3. Copy and paste this script
 * 4. Run: testAndCreateNewSystem()
 */

console.clear();
console.log('🔍 COMPREHENSIVE NUMBER BOX DIAGNOSTIC');
console.log('======================================');

window.testAndCreateNewSystem = function() {
    console.log('\n🎯 Testing D-3 Set-1 8-8-25 Issue...');
    
    // 1. Test current system
    const currentSystemWorking = testCurrentSystem();
    
    if (!currentSystemWorking) {
        console.log('\n🚨 CURRENT SYSTEM NOT WORKING - CREATING NEW SYSTEM');
        createNewNumberBoxSystem();
    } else {
        console.log('\n✅ CURRENT SYSTEM WORKING - NO CHANGES NEEDED');
    }
    
    return { currentSystemWorking };
};

function testCurrentSystem() {
    console.log('\n📊 Testing Current Number Box System...');
    
    // Check for clicked number boxes
    const clickedBoxes = document.querySelectorAll('button[class*="bg-orange"], button[class*="bg-green"], button[style*="background"]');
    console.log(`Found ${clickedBoxes.length} clicked number boxes`);
    
    // Check for matrix highlighting
    const highlightedCells = document.querySelectorAll('td[style*="background"], td[class*="bg-"]');
    let actualHighlights = 0;
    
    highlightedCells.forEach(cell => {
        const style = cell.getAttribute('style') || '';
        if (style.includes('#FCE7C8') || style.includes('#41B3A2') || style.includes('#FFF3E0')) {
            actualHighlights++;
        }
    });
    
    console.log(`Found ${actualHighlights} actual matrix highlights`);
    
    // Test specific scenario: look for clicked boxes vs matrix highlights
    const hasClickedBoxes = clickedBoxes.length > 0;
    const hasMatrixHighlights = actualHighlights > 0;
    
    console.log(`\n📋 Current System Test Results:`);
    console.log(`   Clicked boxes: ${hasClickedBoxes ? '✅' : '❌'}`);
    console.log(`   Matrix highlights: ${hasMatrixHighlights ? '✅' : '❌'}`);
    
    // If we have clicked boxes but no highlights, system is broken
    if (hasClickedBoxes && !hasMatrixHighlights) {
        console.log('❌ SYSTEM BROKEN: Clicked boxes exist but no matrix highlighting');
        return false;
    }
    
    return hasClickedBoxes && hasMatrixHighlights;
}

function createNewNumberBoxSystem() {
    console.log('\n🛠️ CREATING COMPLETELY NEW NUMBER BOX SYSTEM');
    console.log('==============================================');
    
    // 1. Create new number box storage system
    window.newNumberBoxSystem = {
        clickedNumbers: new Map(), // Map<topicDateHr, Set<number>>
        highlightedCells: new Map(), // Map<cellId, highlightType>
        
        // Initialize system
        init() {
            console.log('🎯 Initializing new number box system...');
            this.setupEventListeners();
            this.loadFromStorage();
            this.applyHighlighting();
        },
        
        // Setup event listeners for number boxes
        setupEventListeners() {
            console.log('🔗 Setting up new event listeners...');
            
            // Remove old event listeners and add new ones
            document.querySelectorAll('button').forEach(button => {
                const text = button.textContent?.trim();
                if (text && /^\d+$/.test(text)) {
                    // This is a number button
                    button.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        this.handleNumberClick(button, parseInt(text));
                    });
                }
            });
        },
        
        // Handle number click
        handleNumberClick(button, number) {
            console.log(`🔢 New system handling click: ${number}`);
            
            // Get current context
            const context = this.getCurrentContext();
            if (!context) {
                console.log('❌ Could not determine context');
                return;
            }
            
            const key = `${context.topic}|${context.date}|${context.hr}`;
            
            // Toggle number in clicked set
            if (!this.clickedNumbers.has(key)) {
                this.clickedNumbers.set(key, new Set());
            }
            
            const numberSet = this.clickedNumbers.get(key);
            if (numberSet.has(number)) {
                numberSet.delete(number);
                console.log(`➖ Removed number ${number}`);
            } else {
                numberSet.add(number);
                console.log(`➕ Added number ${number}`);
            }
            
            // Update button visual state
            this.updateButtonState(button, numberSet.has(number));
            
            // Update matrix highlighting
            this.updateMatrixHighlighting(context, number);
            
            // Save to storage
            this.saveToStorage();
        },
        
        // Get current context (topic, date, hr)
        getCurrentContext() {
            // Try to extract from page content
            const pageText = document.body.textContent;
            
            // Look for D-X Set-Y pattern
            const topicMatch = pageText.match(/D-(\d+).*?Set-(\d+)/);
            
            // Look for date pattern (8-8-25, etc.)
            const dateMatch = pageText.match(/(\d{1,2}-\d{1,2}-\d{2,4})/);
            
            // Look for HR pattern
            const hrMatch = pageText.match(/HR-?(\d+)|hr-?(\d+)/i);
            
            if (topicMatch && dateMatch && hrMatch) {
                const topic = `D-${topicMatch[1]} Set-${topicMatch[2]}`;
                const date = dateMatch[1];
                const hr = hrMatch[1] || hrMatch[2];
                
                console.log('📍 Context detected:', { topic, date, hr });
                return { topic, date, hr };
            }
            
            console.log('❌ Could not detect context from page');
            return null;
        },
        
        // Update button visual state
        updateButtonState(button, isClicked) {
            if (isClicked) {
                button.style.backgroundColor = '#fb923c'; // Orange
                button.style.color = 'white';
                button.style.fontWeight = 'bold';
                button.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
            } else {
                button.style.backgroundColor = '';
                button.style.color = '';
                button.style.fontWeight = '';
                button.style.boxShadow = '';
            }
        },
        
        // Update matrix highlighting
        updateMatrixHighlighting(context, number) {
            console.log(`🎨 Updating matrix highlighting for number ${number}`);
            
            // Find all matrix cells containing this number
            const cells = document.querySelectorAll('td');
            
            cells.forEach(cell => {
                const cellText = cell.textContent || '';
                
                // Look for pattern like "as-10-ta" or "mo-10-le"
                if (cellText.includes(`-${number}-`)) {
                    const key = `${context.topic}|${context.date}|${context.hr}`;
                    const numberSet = this.clickedNumbers.get(key);
                    
                    if (numberSet && numberSet.has(number)) {
                        // Highlight this cell
                        cell.style.backgroundColor = '#FCE7C8'; // Orange for now
                        cell.style.color = '#8B4513';
                        cell.style.fontWeight = 'bold';
                        cell.style.border = '2px solid #FB923C';
                        
                        console.log(`✅ Highlighted cell: ${cellText}`);
                    } else {
                        // Remove highlight
                        cell.style.backgroundColor = '';
                        cell.style.color = '';
                        cell.style.fontWeight = '';
                        cell.style.border = '';
                    }
                }
            });
        },
        
        // Apply highlighting to all clicked numbers
        applyHighlighting() {
            console.log('🎨 Applying highlighting to all clicked numbers...');
            
            const context = this.getCurrentContext();
            if (!context) return;
            
            const key = `${context.topic}|${context.date}|${context.hr}`;
            const numberSet = this.clickedNumbers.get(key);
            
            if (!numberSet) return;
            
            // Update all number buttons
            document.querySelectorAll('button').forEach(button => {
                const text = button.textContent?.trim();
                if (text && /^\d+$/.test(text)) {
                    const number = parseInt(text);
                    this.updateButtonState(button, numberSet.has(number));
                }
            });
            
            // Update all matrix cells
            numberSet.forEach(number => {
                this.updateMatrixHighlighting(context, number);
            });
        },
        
        // Save to localStorage
        saveToStorage() {
            const data = {};
            this.clickedNumbers.forEach((numberSet, key) => {
                data[key] = Array.from(numberSet);
            });
            
            localStorage.setItem('newNumberBoxSystem', JSON.stringify(data));
            console.log('💾 Saved to localStorage');
        },
        
        // Load from localStorage
        loadFromStorage() {
            try {
                const stored = localStorage.getItem('newNumberBoxSystem');
                if (stored) {
                    const data = JSON.parse(stored);
                    
                    Object.entries(data).forEach(([key, numbers]) => {
                        this.clickedNumbers.set(key, new Set(numbers));
                    });
                    
                    console.log('📥 Loaded from localStorage');
                }
            } catch (error) {
                console.log('❌ Error loading from storage:', error);
            }
        },
        
        // Debug function to show current state
        debug() {
            console.log('\n🔍 NEW SYSTEM DEBUG INFO:');
            console.log('Clicked numbers:', Object.fromEntries(this.clickedNumbers));
            console.log('Current context:', this.getCurrentContext());
        }
    };
    
    // Initialize the new system
    window.newNumberBoxSystem.init();
    
    console.log('\n✅ NEW NUMBER BOX SYSTEM CREATED AND INITIALIZED');
    console.log('📞 Use: newNumberBoxSystem.debug() to check state');
    console.log('🔄 Use: newNumberBoxSystem.applyHighlighting() to refresh');
    
    // Add helper functions to window
    window.debugNewSystem = () => window.newNumberBoxSystem.debug();
    window.refreshHighlighting = () => window.newNumberBoxSystem.applyHighlighting();
    
    return window.newNumberBoxSystem;
}

// Auto-test when script loads
console.log('\n🚀 Comprehensive Number Box System Ready!');
console.log('📞 Run: testAndCreateNewSystem()');
console.log('💡 This will test current system and create new one if needed');

// Add a quick test function
window.quickTest = function() {
    const clickedBoxes = document.querySelectorAll('button[class*="bg-orange"], button[style*="background"]').length;
    const highlightedCells = document.querySelectorAll('td[style*="background"]').length;
    
    console.log(`Quick test: ${clickedBoxes} clicked boxes, ${highlightedCells} highlighted cells`);
    
    if (clickedBoxes > 0 && highlightedCells === 0) {
        console.log('🚨 ISSUE CONFIRMED: Creating new system...');
        createNewNumberBoxSystem();
    } else {
        console.log('✅ System appears to be working');
    }
};
