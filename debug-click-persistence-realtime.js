/**
 * REAL-TIME CLICK PERSISTENCE DIAGNOSTIC
 * This script will monitor exactly what happens when you click number boxes
 * Copy and paste this into your browser console on the Rule1 page
 */

console.clear();
console.log('🔍 REAL-TIME CLICK PERSISTENCE DIAGNOSTIC STARTED');
console.log('=================================================');

// Global monitoring variables
let clickMonitor = {
    totalClicks: 0,
    saveAttempts: [],
    loadResults: [],
    timingData: [],
    errors: []
};

// Add visual indicator to the page
function addDiagnosticIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'diagnostic-indicator';
    indicator.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: #007bff;
    color: white;
    padding: 10px;
    border-radius: 5px;
    z-index: 10000;
    font-family: monospace;
    font-size: 12px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
  `;
    indicator.innerHTML = '🔍 Click Monitor Active';
    document.body.appendChild(indicator);
}

// Update indicator with latest status
function updateIndicator(status, color = '#007bff') {
    const indicator = document.getElementById('diagnostic-indicator');
    if (indicator) {
        indicator.style.background = color;
        indicator.innerHTML = status;
    }
}

// Monitor all button clicks for number boxes
function setupClickMonitoring() {
    console.log('🎯 Setting up click monitoring...');

    document.addEventListener('click', async function (event) {
        const button = event.target;

        // Check if this is a number box (1-12)
        const buttonText = button.textContent?.trim();
        if (!/^(1[0-2]|[1-9])$/.test(buttonText)) return;

        clickMonitor.totalClicks++;
        const clickId = `click_${clickMonitor.totalClicks}`;
        const startTime = Date.now();

        console.log(`\n🔢 CLICK #${clickMonitor.totalClicks}: Number ${buttonText}`);
        console.log(`⏰ Time: ${new Date().toLocaleTimeString()}`);
        console.log(`🆔 Click ID: ${clickId}`);

        updateIndicator(`🔢 Clicked ${buttonText} - Monitoring...`, '#ff9500');

        // Get current context
        const context = getCurrentContext();
        console.log('📍 Context:', context);

        // Monitor the save operation
        try {
            // Check initial state
            const initialState = await checkDatabaseState(context);
            console.log('📊 Initial DB state:', initialState);

            // Wait for the click to be processed
            await waitForProcessing(500);

            // Check state after processing
            const afterState = await checkDatabaseState(context);
            console.log('📊 After-click DB state:', afterState);

            // Check if the save was successful
            const wasSaved = checkIfNumberWasSaved(buttonText, context, initialState, afterState);
            const endTime = Date.now();
            const duration = endTime - startTime;

            const result = {
                clickId,
                number: buttonText,
                context,
                wasSaved,
                duration,
                timestamp: new Date().toISOString(),
                initialCount: initialState.count,
                afterCount: afterState.count
            };

            clickMonitor.saveAttempts.push(result);

            if (wasSaved) {
                console.log(`✅ SUCCESS: Number ${buttonText} saved to database (${duration}ms)`);
                updateIndicator(`✅ ${buttonText} Saved (${duration}ms)`, '#28a745');
            } else {
                console.log(`❌ FAILED: Number ${buttonText} NOT saved to database (${duration}ms)`);
                updateIndicator(`❌ ${buttonText} Failed (${duration}ms)`, '#dc3545');
            }

            // Test persistence by simulating a refresh check
            setTimeout(async () => {
                await testPersistenceAfterDelay(buttonText, context);
            }, 1000);

        } catch (error) {
            console.error(`💥 Error monitoring click ${clickId}:`, error);
            clickMonitor.errors.push({ clickId, error: error.message });
            updateIndicator(`💥 Error: ${error.message}`, '#dc3545');
        }
    }, true);

    console.log('✅ Click monitoring active');
}

// Get current page context
function getCurrentContext() {
    const userSelect = document.querySelector('select[value]') || document.querySelector('select');
    const hrSelect = document.querySelector('select[title*="HR"]') || document.querySelector('select[id*="hr"]');

    return {
        selectedUser: userSelect?.value || 'unknown',
        activeHR: hrSelect?.value || '1',
        currentDate: '2025-08-01', // Default test date
        pageUrl: window.location.href
    };
}

// Check current database state
async function checkDatabaseState(context) {
    try {
        if (!window.cleanSupabaseService) {
            throw new Error('cleanSupabaseService not available');
        }

        const clicks = await window.cleanSupabaseService.getTopicClicks(
            context.selectedUser,
            null, // all topics
            context.currentDate
        );

        return {
            count: clicks?.length || 0,
            clicks: clicks || [],
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.warn('Database check failed:', error);
        return { count: 0, clicks: [], error: error.message };
    }
}

// Check if a specific number was saved
function checkIfNumberWasSaved(number, context, initialState, afterState) {
    const initialCount = initialState.count;
    const afterCount = afterState.count;

    // Simple check: if count increased, assume save was successful
    if (afterCount > initialCount) return true;

    // Detailed check: look for the specific number in the after state
    const afterClicks = afterState.clicks || [];
    const foundClick = afterClicks.find(click =>
        click.clicked_number == number &&
        click.hour == context.activeHR &&
        click.date_key == context.currentDate
    );

    return !!foundClick;
}

// Wait for processing with visual feedback
async function waitForProcessing(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Test persistence after a delay (simulates refresh)
async function testPersistenceAfterDelay(number, context) {
    console.log(`🔄 Testing persistence for number ${number} after delay...`);

    try {
        const persistenceState = await checkDatabaseState(context);
        const isStillThere = persistenceState.clicks.find(click =>
            click.clicked_number == number &&
            click.hour == context.activeHR &&
            click.date_key == context.currentDate
        );

        if (isStillThere) {
            console.log(`✅ PERSISTENCE CONFIRMED: Number ${number} still in database`);
            updateIndicator(`✅ ${number} Persisted`, '#28a745');
        } else {
            console.log(`❌ PERSISTENCE FAILED: Number ${number} lost from database`);
            updateIndicator(`❌ ${number} Lost!`, '#dc3545');
        }
    } catch (error) {
        console.error('Persistence test failed:', error);
    }
}

// Generate comprehensive report
function generateReport() {
    console.log('\n📊 DIAGNOSTIC REPORT');
    console.log('===================');
    console.log(`Total clicks monitored: ${clickMonitor.totalClicks}`);
    console.log(`Save attempts: ${clickMonitor.saveAttempts.length}`);
    console.log(`Errors: ${clickMonitor.errors.length}`);

    const successful = clickMonitor.saveAttempts.filter(a => a.wasSaved);
    const failed = clickMonitor.saveAttempts.filter(a => !a.wasSaved);

    console.log(`\n✅ Successful saves: ${successful.length}`);
    if (successful.length > 0) {
        console.log('Success details:', successful.map(s => `${s.number} (${s.duration}ms)`));
    }

    console.log(`\n❌ Failed saves: ${failed.length}`);
    if (failed.length > 0) {
        console.log('Failure details:', failed.map(f => `${f.number} (${f.duration}ms)`));
    }

    if (clickMonitor.errors.length > 0) {
        console.log(`\n💥 Errors:`, clickMonitor.errors);
    }

    // Performance statistics
    const durations = clickMonitor.saveAttempts.map(a => a.duration);
    if (durations.length > 0) {
        const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
        const maxDuration = Math.max(...durations);
        const minDuration = Math.min(...durations);

        console.log(`\n⏱️ Performance Stats:`);
        console.log(`   Average save time: ${avgDuration.toFixed(1)}ms`);
        console.log(`   Fastest save: ${minDuration}ms`);
        console.log(`   Slowest save: ${maxDuration}ms`);
    }
}

// Instructions for user
function showInstructions() {
    console.log('\n📋 INSTRUCTIONS:');
    console.log('================');
    console.log('1. Navigate to Rule1 page (Past Days)');
    console.log('2. Select a user and HR');
    console.log('3. Click some number boxes (1-12)');
    console.log('4. Watch the console and the blue indicator in top-right');
    console.log('5. Run generateReport() to see results');
    console.log('6. Try refreshing and see if numbers persist');
    console.log('\nAvailable commands:');
    console.log('- generateReport() - Show diagnostic results');
    console.log('- clickMonitor - View raw monitoring data');
    console.log('- testCurrentState() - Check current database state');
}

// Test current state function
async function testCurrentState() {
    const context = getCurrentContext();
    const state = await checkDatabaseState(context);
    console.log('Current database state:', state);
    return state;
}

// Initialize the diagnostic
function initializeDiagnostic() {
    addDiagnosticIndicator();
    setupClickMonitoring();
    showInstructions();

    // Make functions globally available
    window.generateReport = generateReport;
    window.testCurrentState = testCurrentState;
    window.clickMonitor = clickMonitor;

    console.log('\n🚀 Diagnostic ready! Click some number boxes to start monitoring.');
}

// Auto-initialize
if (typeof window !== 'undefined') {
    initializeDiagnostic();
} else {
    console.log('This script must be run in the browser console');
}
