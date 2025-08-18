// Browser White Page Diagnostic Script
// Run this in the browser console to diagnose white page issues

console.log('🔍 [White Page Diagnostic] Starting diagnostic...');

// Check if React is loaded
console.log('🔍 [React Check] React available:', typeof React !== 'undefined');
console.log('🔍 [React Check] ReactDOM available:', typeof ReactDOM !== 'undefined');

// Check for JavaScript errors
console.log('🔍 [Error Check] Last 10 console errors:');
console.log(console.history || 'Console history not available');

// Check DOM structure
console.log('🔍 [DOM Check] Document body content:', document.body.innerHTML.length > 0 ? 'Has content' : 'Empty');
console.log('🔍 [DOM Check] Root element:', document.getElementById('root'));

// Check network requests
console.log('🔍 [Network Check] Performance entries:');
console.log(performance.getEntriesByType('navigation'));

// Check for main JavaScript bundle
const scripts = Array.from(document.scripts);
console.log('🔍 [Script Check] Loaded scripts:', scripts.map(s => s.src));

// Check for CSS
const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'));
console.log('🔍 [CSS Check] Loaded styles:', styles.map(s => s.href || 'inline'));

// Check for React app mounting
const reactRoot = document.getElementById('root');
if (reactRoot) {
  console.log('🔍 [React Mount] Root element children:', reactRoot.children.length);
  console.log('🔍 [React Mount] Root element content preview:', reactRoot.innerHTML.substring(0, 200));
} else {
  console.log('❌ [React Mount] No root element found!');
}

// Check browser support
console.log('🔍 [Browser Support] User agent:', navigator.userAgent);
console.log('🔍 [Browser Support] ES6 modules:', 'import' in document.createElement('script'));

// Check for import errors
console.log('🔍 [Import Check] Try importing from crossPageSyncService...');
try {
  import('./src/services/crossPageSyncService.js').then(module => {
    console.log('✅ [Import Check] crossPageSyncService imported successfully:', typeof module.default);
  }).catch(error => {
    console.error('❌ [Import Check] crossPageSyncService import failed:', error);
  });
} catch (error) {
  console.error('❌ [Import Check] Dynamic import not supported or error:', error);
}

console.log('🔍 [White Page Diagnostic] Diagnostic complete. Check above logs for issues.');
