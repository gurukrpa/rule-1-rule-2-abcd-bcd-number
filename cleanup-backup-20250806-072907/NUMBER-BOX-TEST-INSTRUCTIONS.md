# Number Box Persistence Testing Instructions

## 🎯 Quick Test Steps

### Step 1: Open Application
1. Go to: http://localhost:5173
2. Select a user (e.g., "Sing Maya")
3. Click "Past Days" button on any 5th+ date

### Step 2: Run Diagnostic
Open browser console (F12) and run:
```javascript
// First, load the diagnostic script
fetch('/number-box-persistence-diagnostic.js')
  .then(response => response.text())
  .then(script => eval(script))
  .then(() => numberBoxPersistenceDiagnostic());
```

### Step 3: Run Comprehensive Test
```javascript
// Load and run the comprehensive test
fetch('/comprehensive-number-box-test.js')
  .then(response => response.text())
  .then(script => eval(script))
  .then(() => comprehensiveNumberBoxTest());
```

### Step 4: Manual Test
1. Click several number boxes (1-12) in the interface
2. Watch console for debug messages
3. Refresh the page (Cmd+R or F5)
4. Check if clicked boxes are still styled after refresh

## 🔍 What to Look For

### ✅ Success Indicators:
- Number boxes change color when clicked (orange/green)
- Console shows "✅ [LOADER-xxx] Number box loading completed successfully"
- After refresh: "📊 Restored State: clickedNumbers: X, presenceStatus: Y"
- Clicked boxes remain styled after page refresh

### ❌ Failure Indicators:
- Number boxes don't change color when clicked
- Console shows "❌ No clicked numbers restored"
- "STATE/RENDER MISMATCH DETECTED" warnings
- No styling restoration after refresh

## 🛠️ Debug Commands

### Check Current State:
```javascript
window.rule1PageDebug?.getStateInfo()
```

### Force Reload State:
```javascript
window.rule1PageDebug?.forceReloadNumberBoxes()
```

### Verify DOM State:
```javascript
window.rule1PageDebug?.verifyDOMState()
```

### Check Database:
```javascript
// If you know the user and date
window.dualServiceManager?.getAllNumberBoxClicksForUserDate("user_id", "2024-01-01")
```

## 📋 Expected Behavior

1. **Click Phase**: Number boxes should change color immediately when clicked
2. **Save Phase**: Console should show database save success
3. **Refresh Phase**: Page refresh should trigger loader
4. **Restore Phase**: Previously clicked boxes should be restored with correct styling

## 🐛 Common Issues

1. **No color change on click**: Check if `handleNumberBoxClick` function is working
2. **No restoration after refresh**: Check if loader is finding database records
3. **Database connection issues**: Check Supabase connection
4. **State timing issues**: Check if loader waits for all dependencies

## 📞 Support

If issues persist, check the console logs for:
- `[LOADER-xxx]` messages for loader status
- `[NumberBoxes]` messages for click handling
- `[STATE-DEBUG]` messages for state management
- Any error messages with stack traces
